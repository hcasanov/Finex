import { put, del } from "@vercel/blob";
import type {
  IStorageService,
  UploadOptions,
  UploadResult,
} from "@/application/ports/IStorageService";

export class VercelBlobStorageService implements IStorageService {
  async upload(
    content: Buffer | Blob,
    pathname: string,
    options?: UploadOptions
  ): Promise<UploadResult> {
    const blob = await put(pathname, content, {
      access: "public",
      contentType: options?.contentType ?? "application/octet-stream",
      cacheControlMaxAge: options?.cacheControl
        ? parseInt(options.cacheControl)
        : 31536000, // 1 year default
    });

    const size = Buffer.isBuffer(content) ? content.length : content.size;

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType ?? options?.contentType ?? "application/octet-stream",
      size,
    };
  }

  async delete(pathname: string): Promise<void> {
    await del(pathname);
  }

  getUrl(pathname: string): string {
    // For Vercel Blob, the URL is stored when uploaded
    // This method is a fallback if we only have the pathname
    return pathname;
  }
}
