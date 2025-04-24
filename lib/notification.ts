import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { databases, DATABASE_ID, projectId } from './appwrite';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => {
        return ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        });
    },
});

// Register for push notifications
export async function registerForPushNotificationsAsync(userId: string): Promise<string | null> {
  let token: string | null = null;
  
  if (Platform.OS === 'web') {
    console.log('Push notifications are not supported on web');
    return null;
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    // Get the token that uniquely identifies this device
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: projectId, // Replace with your project ID
    })).data;
    
    // Store token in Appwrite for this user
    try {
      // You'd typically store this in a 'devices' or 'notification_tokens' collection
      console.log('Expo push token:', token);
      // Additional implementation to store token in Appwrite
    } catch (error) {
      console.error('Error storing push token:', error);
    }
  } else {
    console.log('Must use physical device for push notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#059669',
    });
  }

  return token;
}

// Send push notification
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data = {}
) {
  // This would typically be handled by your server
  // This is a mock implementation for testing purposes
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

// Setup notification listeners
export function setupNotificationListeners(navigation: any) {
  const notificationListener = Notifications.addNotificationReceivedListener(
    notification => {
      console.log('Notification received:', notification);
    }
  );

  const responseListener = Notifications.addNotificationResponseReceivedListener(
    response => {
      const { notification } = response;
      const data = notification.request.content.data as any;
      
      // Navigate to chat if the notification is about a new message
      if (data && data.chatPartnerId) {
        navigation.navigate('chat', { screen: data.chatPartnerId });
      }
    }
  );

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}