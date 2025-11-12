import { StorageProvider } from './provider';
// import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

/**
 * S3 Storage Provider for Production
 * 
 * To use this provider:
 * 1. Install AWS SDK: pnpm add @aws-sdk/client-s3
 * 2. Set environment variables:
 *    - AWS_ACCESS_KEY_ID
 *    - AWS_SECRET_ACCESS_KEY
 *    - AWS_REGION
 *    - AWS_S3_BUCKET
 * 3. Set STORAGE_PROVIDER=s3 in .env
 */
export class S3StorageProvider implements StorageProvider {
  // private s3Client: S3Client;
  private bucket: string;
  private region: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || '';
    this.region = process.env.AWS_REGION || 'us-east-1';

    if (!this.bucket) {
      throw new Error('AWS_S3_BUCKET is not configured');
    }

    // Uncomment when AWS SDK is installed:
    // this.s3Client = new S3Client({
    //   region: this.region,
    //   credentials: {
    //     accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    //   },
    // });
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
      const key = `${folder}/${filename}`;

      // Convert File to Buffer if needed
      let buffer: Buffer;
      if (file instanceof Buffer) {
        buffer = file;
      } else {
        const arrayBuffer = await (file as File).arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      }

      // Uncomment when AWS SDK is installed:
      // const command = new PutObjectCommand({
      //   Bucket: this.bucket,
      //   Key: key,
      //   Body: buffer,
      //   ContentType: opts.contentType || 'application/octet-stream',
      // });
      // await this.s3Client.send(command);

      const url = this.getUrl(key);

      return {
        ok: true,
        url,
        key,
      };
    } catch (error) {
      console.error('S3 storage error:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  getUrl(key: string): string {
    // For CloudFront or public S3:
    const cdnDomain = process.env.AWS_CDN_DOMAIN;
    if (cdnDomain) {
      return `https://${cdnDomain}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async delete(key: string): Promise<{
    ok: boolean;
    error?: string;
  }> {
    try {
      // Uncomment when AWS SDK is installed:
      // const command = new DeleteObjectCommand({
      //   Bucket: this.bucket,
      //   Key: key,
      // });
      // await this.s3Client.send(command);

      return { ok: true };
    } catch (error) {
      console.error('S3 delete error:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }
}

