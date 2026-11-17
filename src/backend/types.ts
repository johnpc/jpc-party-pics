// The ONE seam between the app and whatever serves it. Every network-touching
// call (AppSync, S3, the zip Function URL) goes through this interface so the
// app can run against the real Amplify backend or the in-process fake
// (`VITE_BACKEND=fake`) with zero code changes elsewhere.

export interface ImageRecord {
  key: string;
  size: number;
  date: string;
}

export interface AlbumRecord {
  albumName: string;
}

export interface ImageEvent {
  albumName: string;
  imageKey: string;
}

export type Unsubscribe = () => void;

export interface UrlOptions {
  /** HEAD the object first; reject when it does not exist. */
  validateObjectExistence: boolean;
  /** Presigned-URL lifetime in seconds. */
  expiresIn: number;
}

export interface UploadOptions {
  onProgress?: (transferredBytes: number, totalBytes?: number) => void;
}

export interface Backend {
  listAlbums(): Promise<AlbumRecord[]>;
  createAlbum(albumName: string): Promise<void>;
  listImages(albumName: string): Promise<ImageRecord[]>;
  registerImage(albumName: string, imageKey: string): Promise<void>;
  /** Removes the object AND its registry row. */
  deleteImage(imageKey: string): Promise<void>;
  onImageCreated(listener: (event: ImageEvent) => void): Unsubscribe;
  onImageDeleted(listener: (event: ImageEvent) => void): Unsubscribe;
  getUrl(path: string, options: UrlOptions): Promise<URL>;
  upload(path: string, data: Blob, options?: UploadOptions): Promise<void>;
  requestZip(albumName: string): Promise<{ key: string }>;
}
