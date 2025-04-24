import { databases, DATABASE_ID, messages, chats, storage, storageBucket } from './appwrite';
import { ID, Query, Models } from 'appwrite';
import { Message, Conversation } from './index';
import { sendPushNotification } from './notification';

// Get sorted conversation ID (ensures consistency regardless of who initiates)
export function getConversationId(userId1: string, userId2: string): string {
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
}

// Get user's conversations
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      chats,
      [Query.search('participantIds', userId)]
    );
    
    return response.documents.map(doc => ({
      $id: doc.$id,
      participantIds: doc.participantIds,
      lastMessage: doc.lastMessage,
      lastUpdated: new Date(doc.lastUpdated),
      unreadCount: doc.unreadCount || 0
    }));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

// Get messages for a specific conversation
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      messages,
      [
        Query.equal('conversationId', conversationId),
        Query.orderDesc('$createdAt')
      ]
    );
    
    return response.documents.map(doc => ({
      $id: doc.$id,
      conversationId: doc.conversationId,
      senderId: doc.senderId,
      receiverId: doc.receiverId,
      text: doc.text,
      imageUrl: doc.imageUrl,
      timestamp: new Date(doc.$createdAt),
      read: doc.read || false,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

// Send a new message
export async function sendMessage(
  senderId: string, 
  receiverId: string, 
  text: string,
  imageUri?: string
): Promise<Message> {
  try {
    const conversationId = getConversationId(senderId, receiverId);
    
    // Upload image if provided
    let imageUrl;
    if (imageUri) {
      const fileResponse = await uploadImage(imageUri);
      imageUrl = fileResponse ? fileResponse.$id : undefined;
    }
    
    // Create message
    const messageData = {
      conversationId,
      senderId,
      receiverId,
      text,
      imageUrl,
      read: false
    };
    
    const response = await databases.createDocument(
      DATABASE_ID,
      messages,
      ID.unique(),
      messageData
    );
    
    // Update or create conversation
    await updateConversation(conversationId, text, senderId, receiverId);
    
    // Fetch receiver's push token and send notification
    // This would typically be handled by a server function
    // sendMessageNotification(receiverId, senderId, text);
    
    return {
      $id: response.$id,
      ...messageData,
      timestamp: new Date(response.$createdAt),
      $createdAt: response.$createdAt,
      $updatedAt: response.$updatedAt
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// Update conversation with latest message
async function updateConversation(
  conversationId: string,
  lastMessage: string,
  senderId: string,
  receiverId: string
): Promise<void> {
  try {
    const participantIds = [senderId, receiverId];
    
    // Try to get existing conversation
    try {
      // Check if conversation exists
      await databases.getDocument(
        DATABASE_ID,
        chats,
        conversationId
      );
      
      // Update existing conversation
      await databases.updateDocument(
        DATABASE_ID,
        chats,
        conversationId,
        {
          lastMessage,
          lastUpdated: new Date().toISOString(),
          // Increment unread count for receiver
          // In a real app, you'd use a server function for this
        }
      );
    } catch (error) {
      // Conversation doesn't exist, create it
      await databases.createDocument(
        DATABASE_ID,
        chats,
        conversationId,
        {
          participantIds,
          lastMessage,
          lastUpdated: new Date().toISOString(),
          unreadCount: 1
        }
      );
    }
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
}

// Mark messages as read
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    // Get unread messages sent to this user
    const unreadMessages = await databases.listDocuments(
      DATABASE_ID,
      messages,
      [
        Query.equal('conversationId', conversationId),
        Query.equal('receiverId', userId),
        Query.equal('read', false)
      ]
    );
    
    // Mark each message as read
    const updatePromises = unreadMessages.documents.map(message => 
      databases.updateDocument(
        DATABASE_ID,
        messages,
        message.$id,
        { read: true }
      )
    );
    
    await Promise.all(updatePromises);
    
    // Reset unread count in conversation
    try {
      await databases.updateDocument(
        DATABASE_ID,
        chats,
        conversationId,
        { unreadCount: 0 }
      );
    } catch (error) {
      console.error('Error updating conversation unread count:', error);
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}

// Upload image for chat
async function uploadImage(uri: string): Promise<Models.File | null> {
  try {
    // Convert uri to file
    const uriParts = uri.split('.');
    const fileExtension = uriParts[uriParts.length - 1];
    
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const file = new File([blob], `image_${Date.now()}.${fileExtension}`, {
      type: `image/${fileExtension}`
    });
    
    const result = await storage.createFile(
      storageBucket,
      ID.unique(),
      {
        name: file.name,
        type: file.type,
        size: file.size,
        uri: uri
      }
    );
    
    return result;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

// Get image view URL
export function getImageUrl(fileId: string): string {
  return storage.getFileView(storageBucket, fileId).href;
}