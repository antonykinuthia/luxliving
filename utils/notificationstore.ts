import { create } from 'zustand';
import { databases } from '../lib/appwrite';
import { config } from '../lib/appwrite';
import { Query } from 'appwrite';
import { Notification, NotificationType } from '../lib/notification';

interface NotificationStore {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  activeFilter: NotificationType | 'all';
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  clearNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  setActiveFilter: (filter: NotificationType | 'all') => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,
  activeFilter: 'all',

  fetchNotifications: async () => {
    try {
      set({ loading: true, error: null });
      
      // For demo purposes, we'll simulate some notifications
      // In a real implementation, this would be fetched from Appwrite
      const mockNotifications: Notification[] = [
        {
          id: '1',
          userId: 'user123',
          type: NotificationType.PROPERTY,
          title: 'New Property Listed',
          message: 'A new luxury apartment has been listed in your favorite area.',
          read: false,
          createdAt: new Date().toISOString(),
          metadata: {
            propertyId: 'prop1',
            propertyTitle: 'Luxury Apartment in Downtown',
            propertyImage: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
          },
        },
        {
          id: '2',
          userId: 'user123',
          type: NotificationType.MESSAGE,
          title: 'New Message',
          message: 'Sarah from BlueSky Realty has sent you a message about your inquiry.',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          metadata: {
            senderId: 'agent1',
            senderName: 'Sarah Johnson',
            senderAvatar: 'https://images.pexels.com/photos/5453791/pexels-photo-5453791.jpeg',
          },
        },
        {
          id: '3',
          userId: 'user123',
          type: NotificationType.OFFER,
          title: 'New Offer Received',
          message: 'You have received an offer for your property at 123 Main St.',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          metadata: {
            propertyId: 'prop2',
            propertyTitle: '123 Main St',
            offerId: 'offer1',
            offerAmount: 450000,
          },
        },
        {
          id: '4',
          userId: 'user123',
          type: NotificationType.VIEWING,
          title: 'Viewing Scheduled',
          message: 'A viewing has been scheduled for tomorrow at 2 PM.',
          read: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          metadata: {
            propertyId: 'prop3',
            propertyTitle: 'Modern Townhouse',
            viewingId: 'viewing1',
            viewingDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
          },
        },
        {
          id: '5',
          userId: 'user123',
          type: NotificationType.SYSTEM,
          title: 'Account Verified',
          message: 'Your account has been successfully verified. You now have full access to all features.',
          read: true,
          createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        },
      ];

      set({ notifications: mockNotifications, loading: false });

      // In a real implementation, we would fetch from Appwrite like this:
      /*
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        [
          Query.equal('userId', 'current-user-id'), // Replace with actual user ID
          Query.orderDesc('createdAt'),
        ]
      );
      
      const notifications = response.documents.map(doc => ({
        id: doc.$id,
        userId: doc.userId,
        type: doc.type,
        title: doc.title,
        message: doc.message,
        read: doc.read,
        createdAt: doc.createdAt,
        metadata: doc.metadata,
      }));
      
      set({ notifications, loading: false });
      */
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ error: 'Failed to fetch notifications', loading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      // Update local state first for optimistic UI update
      const updatedNotifications = get().notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      );
      
      set({ notifications: updatedNotifications });
      
      // In a real implementation, we would update in Appwrite:
      /*
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        notificationId,
        { read: true }
      );
      */
    } catch (error) {
      console.error('Error marking notification as read:', error);
      set({ error: 'Failed to mark notification as read' });
      
      // Revert optimistic update on error
      await get().fetchNotifications();
    }
  },

  clearNotification: async (notificationId: string) => {
    try {
      // Update local state first for optimistic UI update
      const updatedNotifications = get().notifications.filter(
        notification => notification.id !== notificationId
      );
      
      set({ notifications: updatedNotifications });
      
      // In a real implementation, we would delete in Appwrite:
      /*
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        notificationId
      );
      */
    } catch (error) {
      console.error('Error clearing notification:', error);
      set({ error: 'Failed to clear notification' });
      
      // Revert optimistic update on error
      await get().fetchNotifications();
    }
  },

  clearAllNotifications: async () => {
    try {
      // Update local state first for optimistic UI update
      set({ notifications: [] });
      
      // In a real implementation, we would batch delete in Appwrite:
      // This would require individual deletion of each notification
      // Or a server-side function that handles batch deletion
      /*
      for (const notification of get().notifications) {
        await databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.notificationsCollectionId,
          notification.id
        );
      }
      */
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      set({ error: 'Failed to clear all notifications' });
      
      // Revert optimistic update on error
      await get().fetchNotifications();
    }
  },

  setActiveFilter: (filter: NotificationType | 'all') => {
    set({ activeFilter: filter });
  },
}));