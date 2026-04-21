export interface StoredFile {
  id: string;
  originalName: string;
  hashName: string;
  mimetype: string;
  path: string;
  size: number;
  createdAt: Date;
}
