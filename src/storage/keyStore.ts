import * as Keychain from 'react-native-keychain';
import { AiProviderId } from '../ai/AiProvider';

const serviceFor = (providerId: AiProviderId) => `diagnostic-app.aikey.${providerId}`;
const ACTIVE_PROVIDER_SERVICE = 'diagnostic-app.activeProvider';

/** API keys live only in the OS keychain/keystore — never in plain storage, never sent anywhere but the provider itself. */
export async function saveApiKey(providerId: AiProviderId, apiKey: string): Promise<void> {
  await Keychain.setGenericPassword(providerId, apiKey, { service: serviceFor(providerId) });
}

export async function getApiKey(providerId: AiProviderId): Promise<string | null> {
  const result = await Keychain.getGenericPassword({ service: serviceFor(providerId) });
  return result ? result.password : null;
}

export async function clearApiKey(providerId: AiProviderId): Promise<void> {
  await Keychain.resetGenericPassword({ service: serviceFor(providerId) });
}

export async function setActiveProvider(providerId: AiProviderId): Promise<void> {
  await Keychain.setGenericPassword('active', providerId, { service: ACTIVE_PROVIDER_SERVICE });
}

export async function getActiveProvider(): Promise<AiProviderId | null> {
  const result = await Keychain.getGenericPassword({ service: ACTIVE_PROVIDER_SERVICE });
  return result ? (result.password as AiProviderId) : null;
}
