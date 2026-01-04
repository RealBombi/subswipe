export interface Channel {
  id: string; // The channel ID
  subscriptionId?: string; // The specific subscription ID (needed for API delete)
  name: string;
  avatar: string;
  subscribers: string;
  lastUpload: string;
  lastUploadDate: Date;
  description: string;
  category: string;
  isInactive: boolean; // True if no upload in > 1 year
}

export type SwipeDirection = 'left' | 'right';

export interface SwipeStats {
  kept: number;
  removed: number;
  total: number;
}