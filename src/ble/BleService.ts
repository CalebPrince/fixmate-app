import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { OBD_BLE_UUIDS } from './uuids';
import { requestBlePermissions } from './permissions';
import { ScannedDevice } from '../types/ble';
import { INIT_COMMANDS } from '../obd/elm327';

const PROMPT_CHAR = '>';
const COMMAND_TIMEOUT_MS = 5000;

/**
 * Talks to any ELM327-compatible OBDII adapter over BLE. One command is
 * in flight at a time — the adapter is a simple request/response serial
 * device under the hood, it doesn't pipeline.
 */
export class BleService {
  private manager = new BleManager();
  private device: Device | null = null;
  private notifySub: Subscription | null = null;
  private responseBuffer = '';
  private pending: { resolve: (v: string) => void; reject: (e: Error) => void } | null = null;

  async scan(
    onDeviceFound: (device: ScannedDevice) => void,
    durationMs = 8000,
  ): Promise<() => void> {
    const granted = await requestBlePermissions();
    if (!granted) throw new Error('Bluetooth permission was not granted.');

    const seen = new Set<string>();
    this.manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) return;
      if (!device || !device.name || seen.has(device.id)) return;
      seen.add(device.id);
      onDeviceFound({ id: device.id, name: device.name, rssi: device.rssi });
    });

    const stop = () => this.manager.stopDeviceScan();
    setTimeout(stop, durationMs);
    return stop;
  }

  async connect(deviceId: string): Promise<void> {
    this.manager.stopDeviceScan();
    const device = await this.manager.connectToDevice(deviceId, { timeout: 10000 });
    await device.discoverAllServicesAndCharacteristics();
    this.device = device;

    this.notifySub = device.monitorCharacteristicForService(
      OBD_BLE_UUIDS.service,
      OBD_BLE_UUIDS.notifyCharacteristic,
      (error, characteristic) => {
        if (error || !characteristic?.value) return;
        this.onNotification(characteristic.value);
      },
    );

    for (const cmd of INIT_COMMANDS) {
      await this.sendCommand(cmd);
    }
  }

  async disconnect(): Promise<void> {
    this.notifySub?.remove();
    this.notifySub = null;
    if (this.device) {
      await this.manager.cancelDeviceConnection(this.device.id).catch(() => undefined);
      this.device = null;
    }
    this.responseBuffer = '';
    this.pending = null;
  }

  isConnected(): boolean {
    return this.device !== null;
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.device) throw new Error('Not connected to an adapter.');
    if (this.pending) throw new Error('A command is already in flight.');

    return new Promise<string>((resolve, reject) => {
      this.pending = { resolve, reject };
      this.responseBuffer = '';

      const timeout = setTimeout(() => {
        if (this.pending) {
          this.pending = null;
          reject(new Error(`Timed out waiting for a response to "${command}".`));
        }
      }, COMMAND_TIMEOUT_MS);

      const originalResolve = this.pending.resolve;
      this.pending.resolve = (v) => {
        clearTimeout(timeout);
        originalResolve(v);
      };

      const payload = Buffer.from(`${command}\r`, 'utf-8').toString('base64');
      this.device!
        .writeCharacteristicWithResponseForService(
          OBD_BLE_UUIDS.service,
          OBD_BLE_UUIDS.writeCharacteristic,
          payload,
        )
        .catch((err) => {
          clearTimeout(timeout);
          this.pending = null;
          reject(err instanceof Error ? err : new Error(String(err)));
        });
    });
  }

  private onNotification(base64Value: string) {
    const chunk = Buffer.from(base64Value, 'base64').toString('utf-8');
    this.responseBuffer += chunk;

    if (this.responseBuffer.includes(PROMPT_CHAR) && this.pending) {
      const finished = this.responseBuffer;
      this.responseBuffer = '';
      const { resolve } = this.pending;
      this.pending = null;
      resolve(finished);
    }
  }

  destroy() {
    this.disconnect();
    this.manager.destroy();
  }
}
