export interface User {
    $id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    isOnline?: boolean;
    lastActive?: Date;
  }
  
  export interface Message {
    $id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    text: string;
    imageUrl?: string;
    timestamp: Date;
    read: boolean;
    $createdAt: string;
    $updatedAt: string;
  }
  
  export interface Conversation {
    $id: string;
    participantIds: string[];
    lastMessage: string;
    lastUpdated: Date;
    unreadCount?: number;
  }
  
  export interface ChatUser {
    id: string;
    name: string;
    avatarUrl?: string;
    lastActive?: Date;
    isOnline?: boolean;
    isTyping?: boolean;
  }
  
  export interface PushNotificationToken {
    value: string;
    device: string;
    platform: string;
  }