const ENCRYPTION_KEY_NAME = 'secure-productivity-encryption-key';

export class EncryptionService {
  private key: CryptoKey | null = null;

  async initialize(): Promise<void> {
    const storedKey = await this.loadKey();
    if (storedKey) {
      this.key = storedKey;
    }
  }

  async generateKey(): Promise<void> {
    const key = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
    
    this.key = key;
    await this.saveKey(key);
  }

  async hasKey(): Promise<boolean> {
    if (this.key) return true;
    const stored = await this.loadKey();
    return stored !== null;
  }

  async encrypt(plaintext: string): Promise<string> {
    if (!this.key) {
      throw new Error('Encryption key not available. Please generate a key in Settings.');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      this.key,
      data
    );

    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  async decrypt(ciphertext: string): Promise<string> {
    if (!this.key) {
      throw new Error('DECRYPT_KEY_MISSING');
    }

    try {
      const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
      
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        this.key,
        data
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      throw new Error('DECRYPT_FAILED');
    }
  }

  async resetKey(): Promise<void> {
    await this.clearKey();
    await this.generateKey();
  }

  async clearKey(): Promise<void> {
    this.key = null;
    localStorage.removeItem(ENCRYPTION_KEY_NAME);
  }

  private async saveKey(key: CryptoKey): Promise<void> {
    const exported = await crypto.subtle.exportKey('jwk', key);
    localStorage.setItem(ENCRYPTION_KEY_NAME, JSON.stringify(exported));
  }

  private async loadKey(): Promise<CryptoKey | null> {
    const stored = localStorage.getItem(ENCRYPTION_KEY_NAME);
    if (!stored) return null;

    try {
      const jwk = JSON.parse(stored);
      return await crypto.subtle.importKey(
        'jwk',
        jwk,
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt']
      );
    } catch {
      return null;
    }
  }
}

export const encryptionService = new EncryptionService();
