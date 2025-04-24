import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, MoveVertical as MoreVertical, Phone } from 'lucide-react-native';
import { ChatUser } from '../lib/index';
import { formatLastActive } from '../utils/formatter';

interface ChatHeaderProps {
  user: ChatUser;
  onInfoPress?: () => void;
  onCallPress?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  user, 
  onInfoPress,
  onCallPress
}) => {
  const router = useRouter();
  const lastActive = user.lastActive ? formatLastActive(user.lastActive) : 'Offline';
  const isOnline = lastActive === 'Online';
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ChevronLeft size={24} color="#1F2937" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.userInfo}
        onPress={onInfoPress}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          {isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={[
            styles.statusText,
            isOnline && styles.onlineText
          ]}>
            {lastActive}
          </Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onCallPress}
        >
          <Phone size={20} color="#1F2937" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onInfoPress}
        >
          <MoreVertical size={20} color="#1F2937" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingTop: Platform.OS === 'ios' ? 48 : 8, // Adjust for iOS status bar
  },
  backButton: {
    padding: 8,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748B',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#059669',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  textContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusText: {
    fontSize: 12,
    color: '#64748B',
  },
  onlineText: {
    color: '#059669',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});

export default ChatHeader;