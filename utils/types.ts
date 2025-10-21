import { ImagePickerAsset } from "expo-image-picker";

interface ChatRoom{
    $id: string;
    title: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: any[];
    $collectionId: string;
    $databaseId: string;
    receiverAvatar: string;
    createdAt: Date;
    upDatedAt: Date;
}

interface Message{
    $id?: string;
    $createdAt?: string;
    $updatedAt?: string;
    $collectionId?: string;
    $databaseId?: string;
    $permissions?: any[];
    content: string;
    senderId: string;
    senderName: string;
    senderPhoto: string;
    chatId: string;
}

interface User{
    name: string;
    email: string;
    avatarUrl: string;
}
export interface PropertyData {
    name: string;
    type: string;
    description: string;
    location: {
      city: string;
      county: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    price: string;
    bedrooms: string;
    bathrooms: string;
    facilities: string[];
    image: string | ImagePickerAsset;
    agentId: string;
  }

  export interface UploadResult {
    success: boolean;
    propertyId?: string;
    error?: string;
  }
  export interface SignUpData {
    email: string;
    password: string;
    name: string;
  }


export interface SignInData {
  email: string;
  password: string;
}
export type {ChatRoom, Message, User};

export interface Video{
  $id: string;
  $createdAt: string;
  userId: string;
  description: string;
  likes: number;
  views: number;
  isLiked?: boolean;
  thumbnailUrl: string;
  username: string;
  videoUrl: string;
  location: string;
  price: number;
}