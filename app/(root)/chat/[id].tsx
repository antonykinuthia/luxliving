import { View, Text, ActivityIndicator, KeyboardAvoidingView, Platform, FlatList, TextInput, Pressable, Image } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ChatRoom, Message } from '@/utils/types'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useHeaderHeight } from '@react-navigation/elements'
import icons from '@/constants/icons'
import { useGlobalContext } from '@/lib/global-provider'
import { client, config, databases } from '@/lib/appwrite'
import { ID, Query } from 'react-native-appwrite'
import { IoIosArrowRoundBack } from "react-icons/io";
import { GoPerson } from "react-icons/go";

const chat = () => {
  const { id: chatId } = useLocalSearchParams()
  const { user } = useGlobalContext()
  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([])
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messageContent, setMessageContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const headerHeight = Platform.OS === 'ios' ? useHeaderHeight() : 0;
  const flatListRef = useRef<FlatList>(null);

  const normalizedChatId = Array.isArray(chatId) ? chatId[0] : chatId;

  useEffect(() => {
    if (!normalizedChatId) {
      router.back();
    }
  }, [normalizedChatId]);

  useEffect(() => {
    if (normalizedChatId) {
      handleFirstMessage()
    }
  }, [normalizedChatId]);

  useEffect(() => {
    if (!normalizedChatId) return;

    const channels = [
      `databases.${config.databaseId}.collections.${config.messagesCollectionId}.documents`
    ];

    console.log('Subscribing to realtime:', channels);

    try {
      const unsubscribe = client.subscribe(channels, (response: any) => {

        console.log("Response:", response);

        try {
          const payload = response.payload as Message;
          
          console.log('Realtime event received:', response.events);

          // if (payload.chatId === normalizedChatId) {
          //   if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          //     console.log('New message received:', payload);
          //     setMessages(prev => [...prev, payload]);
              
          //     setTimeout(() => {
          //       flatListRef.current?.scrollToEnd({ animated: true });
          //     }, 100);
          //   } else if (response.events.includes('databases.*.collections.*.documents.*.update')) {
          //     console.log('Message updated:', payload);
          //     setMessages(prev => 
          //       prev.map(msg => msg.$id === payload.$id ? payload : msg)
          //     );
          //   } else if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
          //     console.log('Message deleted:', payload);
          //     setMessages(prev => prev.filter(msg => msg.$id !== payload.$id));
          //   }
          // }
        } catch (error) {
          console.error('Error processing realtime event:', error);
        }
      }, );

      return () => {
        console.log('Unsubscribing from realtime');
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
      
      // Fallback to polling if WebSocket fails
      console.log('Falling back to polling...');
      const pollInterval = setInterval(() => {
        getMessages();
      }, 5000);
      
      return () => clearInterval(pollInterval);
    }
  }, [normalizedChatId]);

  const handleFirstMessage = async () => {
    setIsLoading(true);
    console.log('handleFirstMessage called');
    
    try {
      // Load chat room first (fast) - Progressive loading
      await getChatRoom();
      setIsLoading(false); // Show UI immediately
      
      // Then load messages in background
      setIsLoadingMessages(true);
      await getMessages();
      setIsLoadingMessages(false);
      
      console.log('Chat loaded successfully');
    } catch (error) {
      console.error('Error loading chat:', error);
      setIsLoading(false);
      setIsLoadingMessages(false);
    }
  }
  
  const getChatRoom = async () => {
    if (!normalizedChatId) {
      return;
    }
    
    try {
      const response = await databases.getDocument(
        config.databaseId!,
        config.chatsCollectionId!,
        normalizedChatId
      );
      setChatRoom(response as ChatRoom);
    } catch (error) {
      console.error('Error getting chat room:', error);
    }
  }

  const sendMessage = async () => {
    if (messageContent.trim() === '' || !normalizedChatId || !user?.$id) {
      return;
    }

    setIsSending(true);
    const tempMessage = messageContent;
    setMessageContent(''); // Clear immediately for better UX
    
    try {
      const messageData = {
        content: tempMessage,
        senderId: user.$id,
        senderName: user.name,
        senderPhoto: user.avatar,
        chatId: normalizedChatId
      };

      console.log('Sending message:', messageData);

      await databases.createDocument(
        config.databaseId!,
        config.messagesCollectionId!,
        ID.unique(),
        messageData
      );

      await databases.updateDocument(
        config.databaseId!,
        config.chatsCollectionId!,
        normalizedChatId,
        {
          lastMessage: new Date().toISOString(),
        }
      );

      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageContent(tempMessage); // Restore on error
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  }

  const getMessages = async () => {
    if (!normalizedChatId) {
      console.error('No chatId provided to getMessages');
      return;
    }

    try {
      console.log('Fetching messages for chat:', normalizedChatId);
      
      const { documents } = await databases.listDocuments(
        config.databaseId!,
        config.messagesCollectionId!,
        [
          Query.equal('chatId', normalizedChatId),
          Query.limit(30), // Reduced from 100 to 30 for faster loading
          Query.orderDesc('$createdAt')
        ]
      ); 
      
      console.log('Messages fetched:', documents.length, 'messages');
      // Reverse to show oldest at top
      setMessages(documents.reverse() as Message[]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false }); // No animation for instant feel
      }, 0);
    } catch (error) {
      console.error('Error getting messages:', error);
    }
  }

  // Debug current state
  console.log('Render state:', { isLoading, hasChat: !!chatRoom, messageCount: messages.length });

  // Skeleton loading screen
  if (isLoading) {
    return (
      <>
        <Stack.Screen/>
        <SafeAreaView className='flex-1 bg-gray-50' edges={['bottom']}>
          <View className='bg-white border-b border-gray-200 px-4 py-3 flex flex-row items-center gap-3'>
            <Pressable onPress={() => router.back()}>
              <IoIosArrowRoundBack className='size-6'/>
            </Pressable>
            <View className='flex flex-row gap-3 items-center'>
              <View className='w-10 h-10 rounded-full bg-gray-300 animate-pulse' />
              <View className='h-5 w-32 bg-gray-300 rounded animate-pulse' />
            </View>
          </View>
          <View className='flex-1 p-4'>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className={`mb-4 ${i % 2 === 0 ? 'items-end' : 'items-start'}`}>
                <View className='flex-row gap-2 max-w-[75%]'>
                  {i % 2 !== 0 && (
                    <View className='w-8 h-8 rounded-full bg-gray-300 animate-pulse' />
                  )}
                  <View className='flex-1'>
                    <View className='h-4 w-20 bg-gray-300 rounded mb-2 animate-pulse' />
                    <View className='bg-gray-300 p-3 rounded-2xl animate-pulse'>
                      <View className='h-4 w-full bg-gray-400 rounded mb-2' />
                      <View className='h-4 w-3/4 bg-gray-400 rounded' />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </SafeAreaView>
      </>
    )
  } 

  if (!chatRoom) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-lg font-rubik-bold text-gray-800 mb-2">Chat not found</Text>
        <Text className="text-gray-600 font-rubik text-center mb-4">
          This chat may have been deleted or you don't have access to it.
        </Text>
        <Pressable 
          onPress={() => router.back()} 
          className="bg-primary-300 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-rubik-medium">Go Back</Text>
        </Pressable>
      </View>
    )
  }

  return (
   <>
    <Stack.Screen/>
      <SafeAreaView className='flex-1 bg-gray-50' edges={['bottom']}>
        <KeyboardAvoidingView 
          className='flex-1' 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={headerHeight}
        >
          <View className='bg-white border-b border-gray-200 px-4 py-3 flex flex-row items-center gap-3'>
            <Pressable onPress={() => router.push('/chat')} className=''>
              <IoIosArrowRoundBack className='size-6'/>
            </Pressable>
            <View className='flex flex-row gap-3 items-center'>
              {!chatRoom.receiverAvatar ? (
                <View className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center'>
                  <GoPerson className='size-6'/>
                </View>
              ) : (
                <Image 
                  source={{uri: chatRoom.receiverAvatar}}
                  className='w-10 h-10 rounded-full'
                  resizeMode='cover'
                />
              )}
              <Text className='text-lg text-black-300 font-rubik-bold'>{chatRoom.title}</Text>
            </View>
          </View>

          {messages.length === 0 ? (
            <View className="flex-1 items-center justify-center p-4">
              {isLoadingMessages ? (
                <>
                  <ActivityIndicator size="large" color="#0061FF" />
                  <Text className="mt-4 text-gray-500 font-rubik">Loading messages...</Text>
                </>
              ) : (
                <Text className="text-gray-500 font-rubik text-center text-lg">
                  No messages yet. Start the conversation!
                </Text>
              )}
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({item}) => {
                const isSender = item.senderId === user?.$id
                return (
                  <View className='px-4 py-1'>
                    <View className={`flex-row gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
                      {!isSender && item.senderPhoto && (
                        <Image 
                          source={{uri: item.senderPhoto}} 
                          className='w-8 h-8 rounded-full mt-1'
                        />
                      )}
                      
                      <View className={`max-w-[75%] ${isSender ? 'items-end' : 'items-start'}`}>
                        {!isSender && (
                          <Text className='font-rubik-medium text-xs text-gray-600 mb-1 ml-2'>
                            {item.senderName}
                          </Text>
                        )}
                        <View className={`${isSender ? 'bg-primary-300' : 'bg-white'} p-3 rounded-2xl shadow-sm`}>
                          <Text className={`font-rubik ${isSender ? 'text-white' : 'text-black-300'} text-base`}>
                            {item.content}
                          </Text>
                          <Text className={`font-rubik text-xs mt-1 ${isSender ? 'text-white/70' : 'text-gray-500'}`}>
                            {new Date(item.$createdAt!).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )
              }}
              keyExtractor={(item) => item.$id || `temp-${Math.random()}`}
              contentContainerStyle={{paddingVertical: 10}}
              onContentSizeChange={() => {
                if (messages.length > 0) {
                  flatListRef.current?.scrollToEnd({ animated: false }); // Instant scroll
                }
              }}
              removeClippedSubviews={true} // Performance optimization
              maxToRenderPerBatch={10} // Render 10 items at a time
              updateCellsBatchingPeriod={50} // Update every 50ms
              initialNumToRender={15} // Show 15 messages initially
              windowSize={10} // Keep 10 screens worth of items in memory
            />
          )}

          {/* Input area */}
          <View className='bg-white border-t border-gray-200 px-4 py-3'>
            <View className='flex-row items-center gap-2 bg-gray-100 rounded-full px-4 py-2'>
              <TextInput
                placeholder='Type a message...'
                multiline
                maxLength={1000}
                className='flex-1 max-h-24 text-black-300 font-rubik text-base'
                value={messageContent}
                onChangeText={setMessageContent}
                placeholderTextColor={'#999'}
                editable={!isSending}
              />
              <Pressable 
                disabled={messageContent.trim() === "" || isSending} 
                className={`w-10 h-10 items-center justify-center rounded-full ${
                  messageContent.trim() && !isSending ? 'bg-primary-300' : 'bg-gray-300'
                }`}
                onPress={sendMessage}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Image 
                    source={icons.send} 
                    style={{
                      width: 20, 
                      height: 20,  
                      tintColor: '#fff'
                    }} 
                  />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
   </>
  )
}

export default chat