import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  ActivityIndicator,
  Keyboard,
  Image
} from 'react-native';
import {  Send, X, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { sendMessage } from '@/lib/SendMessage';
import { CiImageOn } from "react-icons/ci";

interface MessageInputProps {
  senderId: string;
  receiverId: string;
  onMessageSent: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  senderId, 
  receiverId, 
  onMessageSent 
}) => {
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSend = async () => {
    if ((!text.trim() && !imageUri) || isUploading) return;
    
    try {
      setIsUploading(true);
      await sendMessage(senderId, receiverId, text, imageUri || undefined);
      setText('');
      setImageUri(null);
      onMessageSent();
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permissions first
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const clearImage = () => {
    setImageUri(null);
  };

  return (
    <View style={styles.container}>
      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <View style={styles.imagePreview}>
            {Platform.OS === 'web' ? (
              <Image 
                source={{uri: imageUri}} 
                style={{ width: 100, height: 100, borderRadius: 8 }} 
              />
            ) : (
              <View 
                style={{ 
                  width: 100, 
                  height: 100, 
                  borderRadius: 8, 
                  backgroundColor: '#E5E7EB',
                  overflow: 'hidden' 
                }}
              >
                <Image
                  className='width-full height-full'
                  source={{ uri: imageUri }}
                />
              </View>
            )}
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={clearImage}
            >
              <X size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.mediaButton}
          onPress={pickImage}
        >
          <CiImageOn  className='size-5 text-primary-300'/>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.mediaButton}
          onPress={takePhoto}
        >
          <Camera size={24} color="#1E3A8A" />
        </TouchableOpacity>
        
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />
        
        <TouchableOpacity 
          style={[
            styles.sendButton,
            ((!text.trim() && !imageUri) || isUploading) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={(!text.trim() && !imageUri) || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Send size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
    paddingBottom: Platform.OS === 'ios' ? 30 : 8,
  },
  imagePreviewContainer: {
    padding: 8,
    flexDirection: 'row',
  },
  imagePreview: {
    position: 'relative',
    margin: 4,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  mediaButton: {
    padding: 8,
    marginRight: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
    fontSize: 16,
    color: '#1F2937',
  },
  sendButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
});

export default MessageInput;