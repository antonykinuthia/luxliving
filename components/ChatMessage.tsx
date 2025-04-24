import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { formatMessageTime } from '../utils/formatter';
import { getImageUrl } from '../lib/SendMessage';
import { Check, CheckCheck } from 'lucide-react-native';
import { Message } from '../lib/index';

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onImagePress?: (imageUrl: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isOwn, 
  showAvatar = true,
  onImagePress 
}) => {
  const messageTime = formatMessageTime(message.timestamp);
  
  return (
    <View style={[
      styles.container,
      isOwn ? styles.ownContainer : styles.otherContainer
    ]}>
      {showAvatar && !isOwn && (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {message.senderId.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
      )}
      
      <View style={[
        styles.bubble,
        isOwn ? styles.ownBubble : styles.otherBubble
      ]}>
        {message.imageUrl && (
          <TouchableOpacity 
            onPress={() => {
                if (message.imageUrl) {
                    onImagePress?.(getImageUrl(message.imageUrl));
                  }
            }}
            style={styles.imageContainer}
          >
            <Image 
              source={{ uri: getImageUrl(message.imageUrl) }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        
        {message.text && (
          <Text style={[
            styles.messageText,
            isOwn ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {message.text}
          </Text>
        )}
        
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timeText,
            isOwn ? styles.ownTimeText : styles.otherTimeText
          ]}>
            {messageTime}
          </Text>
          
          {isOwn && (
            <View style={styles.readStatus}>
              {message.read ? (
                <CheckCheck size={14} color="#059669" style={styles.readIcon} />
              ) : (
                <Check size={14} color="#9CA3AF" style={styles.readIcon} />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const screenWidth = Dimensions.get('window').width;
const maxBubbleWidth = screenWidth * 0.75;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 8,
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: maxBubbleWidth,
  },
  ownBubble: {
    backgroundColor: '#1E3A8A',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#1F2937',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
  },
  ownTimeText: {
    color: '#CBD5E1',
  },
  otherTimeText: {
    color: '#64748B',
  },
  readStatus: {
    marginLeft: 4,
  },
  readIcon: {
    marginLeft: 2,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
});

export default ChatMessage;