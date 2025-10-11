/**
 * Storage-related type definitions
 */

export interface StoredImage {
  id: string;
  data: string; // base64
  metadata: {
    id: string;
    style: string;
    prompt: string;
    width: number;
    height: number;
    aspectRatio: string;
    seed?: number;
    createdAt: string;
    tags?: string[];
  };
  tags?: string[];
  createdAt: Date;
}

export interface StoredAudio {
  id: string;
  blobUrl: string;
  data: string; // base64
  metadata: {
    id: string;
    genre: string;
    mood: string;
    bpm: number;
    duration: number;
    type: string;
    prompt: string;
    createdAt: string;
    tags?: string[];
  };
  tags?: string[];
  createdAt: Date;
}
