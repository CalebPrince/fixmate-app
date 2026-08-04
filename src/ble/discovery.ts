import { Device } from 'react-native-ble-plx';

/**
 * ELM327 BLE clones vary wildly in which GATT service/characteristics they
 * tunnel serial data through (Nordic UART, HM-10/FFE0, FFF0, fully custom
 * vendor UUIDs...). Rather than hardcode a guess, inspect whatever the
 * connected adapter actually exposes and find a usable read/write pair.
 */

const STANDARD_SERVICE_PREFIXES = [
  '00001800', // Generic Access
  '00001801', // Generic Attribute
  '0000180a', // Device Information
  '0000180f', // Battery Service
  '00001804', // Tx Power
  '00001805', // Current Time
  '0000fe',   // various SIG-reserved advertising/beacon services
];

function isStandardService(uuid: string): boolean {
  const lower = uuid.toLowerCase();
  return STANDARD_SERVICE_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

export interface UartChannel {
  serviceUUID: string;
  writeCharacteristicUUID: string;
  notifyCharacteristicUUID: string;
  writeWithResponse: boolean;
}

export async function discoverUartChannel(device: Device): Promise<UartChannel> {
  await device.discoverAllServicesAndCharacteristics();
  const services = await device.services();

  const custom = services.filter((s) => !isStandardService(s.uuid));
  const orderedServices = [...custom, ...services.filter((s) => !custom.includes(s))];

  // Prefer a single service that has both a write and a notify characteristic.
  for (const service of orderedServices) {
    const characteristics = await service.characteristics();
    const notifyChar = characteristics.find((c) => c.isNotifiable || c.isIndicatable);
    const writeChar = characteristics.find((c) => c.isWritableWithResponse || c.isWritableWithoutResponse);

    if (notifyChar && writeChar) {
      return {
        serviceUUID: service.uuid,
        writeCharacteristicUUID: writeChar.uuid,
        notifyCharacteristicUUID: notifyChar.uuid,
        writeWithResponse: writeChar.isWritableWithResponse,
      };
    }
  }

  // Fall back to mixing a notify characteristic from one service with a
  // write characteristic from another, in case they aren't bundled together.
  let notifyMatch: { serviceUUID: string; uuid: string } | null = null;
  let writeMatch: { serviceUUID: string; uuid: string; writeWithResponse: boolean } | null = null;
  const foundServiceUUIDs: string[] = [];

  for (const service of orderedServices) {
    foundServiceUUIDs.push(service.uuid);
    const characteristics = await service.characteristics();
    if (!notifyMatch) {
      const c = characteristics.find((ch) => ch.isNotifiable || ch.isIndicatable);
      if (c) notifyMatch = { serviceUUID: service.uuid, uuid: c.uuid };
    }
    if (!writeMatch) {
      const c = characteristics.find((ch) => ch.isWritableWithResponse || ch.isWritableWithoutResponse);
      if (c) writeMatch = { serviceUUID: service.uuid, uuid: c.uuid, writeWithResponse: c.isWritableWithResponse };
    }
  }

  if (notifyMatch && writeMatch) {
    return {
      serviceUUID: writeMatch.serviceUUID,
      writeCharacteristicUUID: writeMatch.uuid,
      notifyCharacteristicUUID: notifyMatch.uuid,
      writeWithResponse: writeMatch.writeWithResponse,
    };
  }

  throw new Error(
    `No compatible read/write channel found on this adapter. Services seen: ${foundServiceUUIDs.join(', ') || 'none'}.`,
  );
}
