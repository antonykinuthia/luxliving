interface ChatRoom{
    $id: string;
    title: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: any[];
    $collectionId: string;
    $databaseId: string;
    description: string;
    imageUrl: string;
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
    imageUrl: string;
    chatRoomId: string;
}

interface User{
    name: string;
    email: string;
    avatarUrl: string;
}

export type {ChatRoom, Message, User};