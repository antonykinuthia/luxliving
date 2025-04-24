import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { formatConversationTime } from '../utils/formatter';
import { Conversation, ChatUser } from '../lib/index';

interface ConversationItemProps {
  conversation: Conversation;
  user: ChatUser;
  onPress: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ 
  conversation, 
  user, 
  onPress 
}) => {
  const time = formatConversationTime(conversation.lastUpdated);
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {user.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {user.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>
        
        <View style={styles.messageContainer}>
          <Text style={styles.messageText} numberOfLines={1}>
            {conversation.lastMessage}
          </Text>
          
          {conversation.unreadCount ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64748B',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#059669',
    borderWidth: 2,
    borderColor: 'white',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ConversationItem;