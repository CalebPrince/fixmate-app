/**
 * GATT UUIDs for talking to the adapter over BLE.
 *
 * These default to the Nordic UART Service (NUS) pattern, which most cheap
 * ELM327 BLE clones — including most KONNWEI BT5.x models — reuse for
 * tunneling AT commands. NOT CONFIRMED against the user's exact adapter yet:
 * verify by connecting once and inspecting discovered services/characteristics
 * (see BleService.discoverServices), then update these if they differ.
 */
export const OBD_BLE_UUIDS = {
  service: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  writeCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
  notifyCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
};
