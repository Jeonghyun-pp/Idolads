import { StorageProvider } from './provider';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './public/uploads';
  }

  async put(
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
  }> {
    try {
      const folder = opts.folder || 'general';
      const ext = opts.contentType?.split('/')[1] || 'jpg';
      const filename = opts.key || `${randomUUID()}.${ext}`;
      const folderPath = join(this.uploadDir, folder);
      const filePath = join(folderPath, filename);

      // Ensure directory exists
      await mkdir(folderPath, { recursive: true });

      // Convert File to Buffer if needed
      let buffer: Buffer;
      if (file instanceof Buffer) {
        buffer = file;
      } else {
        const arrayBuffer = await (file as File).arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      }

      await writeFile(filePath, buffer);

      const url = `/uploads/${folder}/${filename}`;
      const key = `${folder}/${filename}`;

      return {
        ok: true,
        url,
        key,
      };
    } catch (error) {
      console.error('Local storage error:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }

  async delete(key: string): Promise<{
    ok: boolean;
    error?: string;
  }> {
    try {
      const { unlink } = await import('fs/promises');
      const filePath = join(this.uploadDir, key);
      await unlink(filePath);
      return { ok: true };
    } catch (error) {
      console.error('Local delete error:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }
}

