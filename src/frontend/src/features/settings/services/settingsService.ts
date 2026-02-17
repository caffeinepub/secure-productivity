import type { backendInterface, Settings } from '@/backend';
import { encryptionService } from '@/core/crypto/encryptionService';

export class SettingsService {
  constructor(private actor: backendInterface) {}

  async getUserSettings(): Promise<Settings> {
    try {
      return await this.actor.getUserSettings();
    } catch (error: any) {
      if (error.message?.includes('No settings found')) {
        return { darkMode: false };
      }
      throw error;
    }
  }

  async saveUserSettings(settings: Settings): Promise<void> {
    return this.actor.saveUserSettings(settings);
  }

  async hasEncryptionKey(): Promise<boolean> {
    return encryptionService.hasKey();
  }

  async generateEncryptionKey(): Promise<void> {
    return encryptionService.generateKey();
  }

  async resetEncryptionKey(): Promise<void> {
    return encryptionService.resetKey();
  }
}
