export interface UploadOptions {
  contentType?: string;
  cacheControl?: string;
}

export interface UploadResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}

export interface IStorageService {
  upload(
    content: Buffer | Blob,
    pathname: string,
    options?: UploadOptions
  ): Promise<UploadResult>;
  delete(pathname: string): Promise<void>;
  getUrl(pathname: string): string;
}
