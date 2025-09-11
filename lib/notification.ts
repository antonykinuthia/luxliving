export enum NotificationType {
  PROPERTY = 'property',
  MESSAGE = 'message',
  OFFER = 'offer',
  VIEWING = 'viewing',
  SYSTEM = 'system',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string; // ISO date string
  metadata?: {
    propertyId?: string;
    propertyTitle?: string;
    propertyImage?: string;
    senderId?: string;
    senderName?: string;
    senderAvatar?: string;
    offerId?: string;
    offerAmount?: number;
    viewingId?: string;
    viewingDate?: string;
  };
}