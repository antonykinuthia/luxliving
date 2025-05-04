import { View, Text, ActivityIndicator, KeyboardAvoidingView, Platform, FlatList, TextInput, Pressable, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ChatRoom, Message } from '@/utils/types'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useHeaderHeight } from '@react-navigation/elements'
import icons from '@/constants/icons'
import { useGlobalContext } from '@/lib/global-provider'
import { client, config, databases } from '@/lib/appwrite'
import { ID, Query } from 'react-native-appwrite'
import { set } from 'date-fns'

const chat = () => {
  const { chat: chatId } = useLocalSearchParams()
  const { user } = useGlobalContext()
  const router = useRouter()

  if(!chatId) router.back();

  const [message, setMessages] = useState<Message[]>([])
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messageConent, setMessageContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const headerHeight = Platform.OS === 'ios' ? useHeaderHeight() : 0;

  useEffect(() => {
    handleFirstMessage()
  }, []);

  useEffect(() => {
    const channel = `databases.${config.databaseId}.collections.${config.chatsCollectionId}.documents.${chatId}`;

    const unsubscribe = client.subscribe(channel, () => {
      getMessages();
    })

    return () => unsubscribe();
  }, [chatId]);

  const handleFirstMessage = async () => {
    try {
      await getMessages();
      await getChatRoom();
    } catch (error) {
      console.log(error);
    }
  }
  
  const getChatRoom = async () => {
    try {
      const response = await databases.getDocument(
        config.databaseId!,
        config.chatsCollectionId!,
        chatId as string
      )
      setChatRoom(response as ChatRoom);
    } catch (error) {
      
    }
  }

  const sendMessage = async () => {
    if(messageConent.trim() === '') return;
    try {
      const message = {
        content: messageConent,
        senderId: user?.$id,
        senderName: user?.name,
        senderAvatar: user?.avatar,
        chatId: chatId
      };

      await databases.createDocument(
        config.databaseId!,
        config.messagesCollectionId!,
        ID.unique(),
        message
      );

      setMessageContent("");

      await databases.updateDocument(
        config.databaseId!,
        config.chatsCollectionId!,
        chatId as string,
        {
         $updatedAt: new Date().toISOString(),
        }
      )
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  const getMessages = async () => {
    try {
      const {documents, total} = await databases.listDocuments(
        config.databaseId!,
        config.messagesCollectionId!,
        [
          Query.equal('chatId', chatId as string),
          Query.limit(100),
          Query.orderAsc('$createdAt')
        ]
      );  
      setMessages(documents as Message[]);

    } catch (error) {
      console.log(error);
    }
  }

if(isLoading) {
  return (
    <View>
      <ActivityIndicator size={'large'} className='text-primary-300 mt-5'/>
    </View>
  )
} 

  return (
   <>
    <Stack.Screen options={{
      title: chatRoom?.title,
      headerShown: true 
    }}/>
      <SafeAreaView className='flex-1' edges={['top', 'bottom']}>
        <KeyboardAvoidingView className='flex-1' behavior='padding'
        keyboardVerticalOffset={headerHeight}>
          <FlatList
          data={message}
          renderItem={({item}) => {
            const isSender = item.senderId === user?.$id
            return (
              <View className={`p-3 rounded-lg flex-row gap-1 max-w-[80%] ${isSender ? 'self-end' : 'self-start'}`}>
                {!isSender && (
                    <Image source={{uri: item.imageUrl}} className='w-7 h-7 rounded-full'/>
                )}
                <View className={`${isSender ? 'text-right bg-primary-300' : 'text-left bg-primary-200'} flex-1 p-3 rounded-lg`}>
                  <Text className='font-rubik-bold text-xl'>{item.senderName}</Text>
                  <Text>{item.content}</Text>
                  <Text className='text-xs text-right'>
                    {new Date(item.$createdAt).toLocaleString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</Text>
                </View>
              </View>
            )
          }}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{padding: 10}}
          initialScrollIndex={message.length - 1}
          
          />

          <View className='flex-row items-center justify-between px-4 py-2 border border-gray-200 rounded-xl bg-primary-200 mx-3 mb-2'>
            <TextInput
            placeholder='Message'
            multiline
            className='min-h-10 flex-grow p-2 flex-shrink'
            value={messageConent}
            onChangeText={setMessageContent}
            placeholderTextColor={'#666876'}
            />
            <Pressable className='w-10 h-10 items-center justify-center' onPress={sendMessage}>
              <Image source={icons.send} style={{width: 24, height: 24, tintColor: '#0061FF'}} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
   </>
  )
}

export default chat