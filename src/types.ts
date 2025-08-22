export interface SharedFile {
  uid: string;
  name: string;
  size: number;
  path: string;
  isFolder?: boolean;
  fingerprint?: string;
}

