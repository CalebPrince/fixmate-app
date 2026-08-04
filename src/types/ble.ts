export interface ScannedDevice {
  id: string;
  name: string;
  rssi: number | null;
}

export type ConnectionState = 'disconnected' | 'scanning' | 'connecting' | 'connected';
