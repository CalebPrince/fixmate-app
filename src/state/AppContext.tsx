import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { BleService } from '../ble/BleService';
import { ObdClient } from '../obd/ObdClient';
import { ScannedDevice, ConnectionState } from '../types/ble';
import { PidReading, TroubleCode } from '../types/obd';
import { DiagnosisResult, VehicleProfile } from '../types/diagnosis';
import { AiProviderId } from '../ai/AiProvider';
import { AI_PROVIDERS } from '../ai/registry';
import { getActiveProvider, getApiKey, setActiveProvider as persistActiveProvider } from '../storage/keyStore';

interface AppContextValue {
  connectionState: ConnectionState;
  connectedDeviceName: string | null;
  connectionError: string | null;
  scannedDevices: ScannedDevice[];
  scan: () => Promise<void>;
  connect: (device: ScannedDevice) => Promise<void>;
  disconnect: () => Promise<void>;

  vehicle: VehicleProfile;
  setVehicle: (v: VehicleProfile) => void;

  telemetry: PidReading[];
  activeCodes: TroubleCode[];
  refreshing: boolean;
  refreshError: string | null;
  refresh: () => Promise<void>;

  activeProviderId: AiProviderId | null;
  setActiveProviderId: (id: AiProviderId) => Promise<void>;

  diagnosis: DiagnosisResult | null;
  diagnosisLoading: boolean;
  diagnosisError: string | null;
  runDiagnosis: (dtc: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const DEFAULT_VEHICLE: VehicleProfile = {
  year: new Date().getFullYear(),
  make: '',
  model: '',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const bleRef = useRef<BleService>(new BleService());
  const obdRef = useRef<ObdClient>(new ObdClient(bleRef.current));

  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [scannedDevices, setScannedDevices] = useState<ScannedDevice[]>([]);

  const [vehicle, setVehicle] = useState<VehicleProfile>(DEFAULT_VEHICLE);
  const [telemetry, setTelemetry] = useState<PidReading[]>([]);
  const [activeCodes, setActiveCodes] = useState<TroubleCode[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const [activeProviderId, setActiveProviderIdState] = useState<AiProviderId | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);

  React.useEffect(() => {
    getActiveProvider().then((id) => id && setActiveProviderIdState(id));
  }, []);

  const scan = useCallback(async () => {
    setConnectionState('scanning');
    setConnectionError(null);
    setScannedDevices([]);
    try {
      await bleRef.current.scan((device) => {
        setScannedDevices((prev) => (prev.some((d) => d.id === device.id) ? prev : [...prev, device]));
      });
    } catch (err) {
      setConnectionError(err instanceof Error ? err.message : String(err));
    } finally {
      setConnectionState((s) => (s === 'scanning' ? 'disconnected' : s));
    }
  }, []);

  const connect = useCallback(async (device: ScannedDevice) => {
    setConnectionState('connecting');
    setConnectionError(null);
    try {
      await bleRef.current.connect(device.id);
      setConnectedDeviceName(device.name);
      setConnectionState('connected');
    } catch (err) {
      setConnectionState('disconnected');
      setConnectionError(
        err instanceof Error
          ? `Couldn't connect to ${device.name}: ${err.message}`
          : `Couldn't connect to ${device.name}: ${String(err)}`,
      );
      throw err;
    }
  }, []);

  const disconnect = useCallback(async () => {
    await bleRef.current.disconnect();
    setConnectedDeviceName(null);
    setConnectionState('disconnected');
    setTelemetry([]);
    setActiveCodes([]);
  }, []);

  const refresh = useCallback(async () => {
    if (!bleRef.current.isConnected()) return;
    setRefreshing(true);
    setRefreshError(null);
    const failures: string[] = [];
    try {
      // Run sequentially, not Promise.all — the adapter only handles one command
      // at a time, and one failing read shouldn't block the other from updating.
      try {
        setTelemetry(await obdRef.current.readAllPids());
      } catch (err) {
        failures.push(`telemetry: ${err instanceof Error ? err.message : String(err)}`);
      }
      try {
        setActiveCodes(await obdRef.current.readTroubleCodes());
      } catch (err) {
        failures.push(`trouble codes: ${err instanceof Error ? err.message : String(err)}`);
      }
      if (failures.length > 0) setRefreshError(failures.join(' · '));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const setActiveProviderId = useCallback(async (id: AiProviderId) => {
    await persistActiveProvider(id);
    setActiveProviderIdState(id);
  }, []);

  const runDiagnosis = useCallback(
    async (dtc: string) => {
      if (!activeProviderId) {
        setDiagnosisError('Pick an AI provider and add its key in Settings first.');
        return;
      }
      setDiagnosisLoading(true);
      setDiagnosisError(null);
      setDiagnosis(null);
      try {
        const apiKey = await getApiKey(activeProviderId);
        if (!apiKey) {
          setDiagnosisError(`No API key saved for ${AI_PROVIDERS[activeProviderId].label}.`);
          return;
        }
        const result = await AI_PROVIDERS[activeProviderId].diagnose(
          {
            vehicle,
            activeCodes: activeCodes.filter((c) => c.code === dtc || activeCodes.length === 1),
            telemetry,
          },
          apiKey,
        );
        setDiagnosis(result);
      } catch (err) {
        setDiagnosisError(err instanceof Error ? err.message : String(err));
      } finally {
        setDiagnosisLoading(false);
      }
    },
    [activeProviderId, vehicle, activeCodes, telemetry],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      connectionState,
      connectedDeviceName,
      connectionError,
      scannedDevices,
      scan,
      connect,
      disconnect,
      vehicle,
      setVehicle,
      telemetry,
      activeCodes,
      refreshing,
      refreshError,
      refresh,
      activeProviderId,
      setActiveProviderId,
      diagnosis,
      diagnosisLoading,
      diagnosisError,
      runDiagnosis,
    }),
    [
      connectionState,
      connectedDeviceName,
      connectionError,
      scannedDevices,
      scan,
      connect,
      disconnect,
      vehicle,
      telemetry,
      activeCodes,
      refreshing,
      refreshError,
      refresh,
      activeProviderId,
      setActiveProviderId,
      diagnosis,
      diagnosisLoading,
      diagnosisError,
      runDiagnosis,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider.');
  return ctx;
}
