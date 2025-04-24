import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { getUserConversations } from '@/lib/chats';
import ConversationItem from '@/components/ConversationItem';
import EmptyConversationList from '@/components/EmptyConversation';
import { Conversation, ChatUser } from '@/lib/index';
import { client } from '@/lib/appwrite';
import { useIsFocused } from '@react-navigation/native';
import { useGlobalContext } from '@/lib/global-provider';

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

export default function ChatListScreen() {
  const router = useRouter();
  const { user} =  useGlobalContext();
  const isFocused = useIsFocused();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to get the other user in the conversation
  const getOtherUser = (conversation: Conversation): ChatUser => {
    if (!user) return MOCK_USERS['user1']; // Fallback
    
    const otherUserId = conversation.participantIds.find(id => id !== user.$id);
    return MOCK_USERS[otherUserId || 'user1'] || {
      id: otherUserId || 'unknown',
      name: 'Unknown User',
      isOnline: false,
    };
  };
  
  // Load conversations
  const loadConversations = useCallback(async () => {
    if ( !user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await getUserConversations(user.$id);
      
      // Sort by lastUpdated (most recent first)
      const sortedConversations = data.sort((a, b) => 
        b.lastUpdated.getTime() - a.lastUpdated.getTime()
      );
      
      setConversations(sortedConversations);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations. Please try again.');
      
      // For demo purposes, set some mock data if loading fails
      setConversations([
        {
          $id: 'conv1',
          participantIds: [user.$id, 'user1'],
          lastMessage: 'Is the property still available?',
          lastUpdated: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          unreadCount: 2,
        },
        {
          $id: 'conv2',
          participantIds: [user.$id, 'user2'],
          lastMessage: 'Can we schedule a viewing tomorrow?',
          lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          unreadCount: 0,
        },
        {
          $id: 'conv3',
          participantIds: [user.$id, 'user3'],
          lastMessage: 'The offer has been accepted!',
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          unreadCount: 0,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Load data when screen is focused or dependencies change
  useEffect(() => {
    if (isFocused) {
      loadConversations();
    }
  }, [loadConversations, isFocused]);
  
  // Subscribe to real-time updates (using Appwrite realtime)
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = client.subscribe(`databases.*.collections.conversations.documents`, (response) => {
      // Update the conversation list when changes occur
      loadConversations();
    });
    
    return () => {
      unsubscribe();
    };
  }, [user, loadConversations]);
  
  // Navigate to individual chat
  const handleConversationPress = (conversation: Conversation, chatUser: ChatUser) => {
    router.push(`/chats/${chatUser.id}`);
  };
  
  // Render each conversation item
  const renderItem = ({ item }: { item: Conversation }) => {
    const chatUser = getOtherUser(item);
    
    return (
      <ConversationItem
        conversation={item}
        user={chatUser}
        onPress={() => handleConversationPress(item, chatUser)}
      />
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : conversations.length === 0 ? (
        <EmptyConversationList />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  listContent: {
    flexGrow: 1,
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
  },
});