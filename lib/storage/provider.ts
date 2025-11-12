export interface StorageProvider {
  put(
    file: File | Buffer,
    opts: {
      key?: string;
      contentType?: string;
      folder?: string;
    }
  ): Promise<{
    ok: boolean;
    url?: string;
    key?: string;
    error?: string;
  }>;

  getUrl(key: string): string;

  delete?(key: string): Promise<{
    ok: boolean;
    error?: string;
  }>;
}

// Provider factory
export async function getStorageProvider(): Promise<StorageProvider> {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  switch (provider) {
    case 'local':
      const { LocalStorageProvider } = await import('./local');
      return new LocalStorageProvider();
    case 's3':
      const { S3StorageProvider } = await import('./s3');
      return new S3StorageProvider();
    default:
      throw new Error(`Unknown storage provider: ${provider}`);
  }
}

