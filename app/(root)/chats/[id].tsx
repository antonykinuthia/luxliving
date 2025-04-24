import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Modal,
  Image
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useGlobalContext } from '@/lib/global-provider';
import { getConversationMessages, getConversationId, markMessagesAsRead } from '@/lib/chats';
import ChatHeader from '@/components/ChatHeader';
import ChatMessage from '@/components/ChatMessage';
import MessageInput from '@/components/MessageInput';
import { Message, ChatUser } from '@/lib/index';
import { client } from '@/lib/appwrite';
import { X } from 'lucide-react-native';

// Mock user data (in a real app this would come from your API)
const MOCK_USERS: Record<string, ChatUser> = {
  'user1': {
    id: 'user1',
    name: 'John Smith',
    isOnline: true,
    lastActive: new Date(),
  },
  'user2': {
    id: 'user2',
    name: 'Sarah Johnson',
    isOnline: false,
    lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  'user3': {
    id: 'user3',
    name: 'Michael Brown',
    isOnline: true,
    lastActive: new Date(),
  },
  'user4': {
    id: 'user4',
    name: 'Jessica Williams',
    isOnline: false,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
};

interface MessagePayload {
  conversationId: string;
  [key: string]: any; // optional, allows for other fields
}

export default function ChatScreen() {
  const { chatPartnerId } = useLocalSearchParams<{ chatPartnerId: string }>();
  const { user } = useGlobalContext();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatPartner, setChatPartner] = useState<ChatUser | null>(null);
  const [imageViewUrl, setImageViewUrl] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  
  // Get the conversation ID
  const getConvoId = useCallback(() => {
    if (!user || !chatPartnerId) return null;
    return getConversationId(user.$id, chatPartnerId);
  }, [user, chatPartnerId]);
  
  // Load messages
  const loadMessages = useCallback(async () => {
    if (!user || !chatPartnerId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const conversationId = getConvoId();
      if (!conversationId) return;
      
      // Load partner info
      setChatPartner(MOCK_USERS[chatPartnerId] || {
        id: chatPartnerId,
        name: `User ${chatPartnerId}`,
        isOnline: Math.random() > 0.5,
        lastActive: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)),
      });
      
      // Mark messages as read
      await markMessagesAsRead(conversationId, user.$id);
      
      // Load messages
      const data = await getConversationMessages(conversationId);
      setMessages(data);
      
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages. Please try again.');
      
      // Mock data for demo purposes
      setMessages([
        {
          $id: 'msg1',
          conversationId: getConvoId() || '',
          senderId: chatPartnerId || '',
          receiverId: user?.$id || '',
          text: 'Hello! I saw your listing for the downtown apartment. Is it still available?',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          read: true,
          $createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          $updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          $id: 'msg2',
          conversationId: getConvoId() || '',
          senderId: user?.$id || '',
          receiverId: chatPartnerId || '',
          text: 'Yes, it\'s still available! Would you like to schedule a viewing?',
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          read: true,
          $createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          $updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        },
        {
          $id: 'msg3',
          conversationId: getConvoId() || '',
          senderId: chatPartnerId || '',
          receiverId: user?.$id || '',
          text: 'That would be great! I\'m available tomorrow afternoon around 3pm. Does that work for you?',
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          read: true,
          $createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          $updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        },
        {
          $id: 'msg4',
          conversationId: getConvoId() || '',
          senderId: chatPartnerId || '',
          receiverId: user?.$id || '',
          text: 'Also, could you send me some more pictures of the kitchen and bathroom?',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          read: true,
          $createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          $updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          $id: 'msg5',
          conversationId: getConvoId() || '',
          senderId: user?.$id || '',
          receiverId: chatPartnerId || '',
          text: '3pm works perfectly! I\'ll send you some additional photos right away.',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          read: false,
          $createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          $updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [user, chatPartnerId, getConvoId]);
  
  // Load messages when component mounts
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!user || !chatPartnerId) return;
    
    const conversationId = getConvoId();
    if (!conversationId) return;
    
    const unsubscribe = client.subscribe(`databases.*.collections.messages.documents`, response => {
      const payload = response.payload as MessagePayload;
    
      if (payload.conversationId === conversationId) {
        loadMessages();
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [user, chatPartnerId, getConvoId, loadMessages]);
  
  // Handle new message
  const handleMessageSent = () => {
    loadMessages();
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 300);
  };
  
  // Render message item
  const renderMessageItem = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.senderId === user?.$id;
    const showAvatar = index === 0 || messages[index - 1].senderId !== item.senderId;
    
    return (
      <ChatMessage
        message={item}
        isOwn={isOwn}
        showAvatar={showAvatar}
        onImagePress={item.imageUrl ? (url) => setImageViewUrl(url) : undefined}
      />
    );
  };
  
  // Handle image viewer close
  const handleCloseImageViewer = () => {
    setImageViewUrl(null);
  };
  
  if (!chatPartnerId || !user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid chat partner</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/chat')}
        >
          <Text style={styles.backButtonText}>Go back to chat list</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {chatPartner && (
        <ChatHeader
          user={chatPartner}
          onInfoPress={() => {}}
          onCallPress={() => {}}
        />
      )}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.messagesList}
          inverted
        />
      )}
      
      <MessageInput
        senderId={user.$id}
        receiverId={chatPartnerId}
        onMessageSent={handleMessageSent}
      />
      
      {/* Image Viewer Modal */}
      <Modal
        visible={!!imageViewUrl}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseImageViewer}
          >
            <X size={24} color="white" />
          </TouchableOpacity>
          
          {imageViewUrl && (
            <Image
              source={{ uri: imageViewUrl }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  messagesList: {
    flexGrow: 1,
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
});