import { View, Text, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator, Image } from 'react-native'
import React, { useEffect } from 'react'
import { ChatRooms } from '@/utils/test-data'
import { useState } from 'react'
import { Link, usePathname,useLocalSearchParams } from 'expo-router'
import { ChatRoom } from '@/utils/types'
import { databases,config } from '@/lib/appwrite'
import { Query } from 'react-native-appwrite'
import { IoChevronForwardSharp } from "react-icons/io5";
import { useAppwrite } from '@/lib/useAppwrite'
import images from '@/constants/images'
import { useGlobalContext } from '@/lib/global-provider'
import { GoPerson } from 'react-icons/go'

 interface chatProps {
  chatRoom: ChatRoom;
  currentUserId: string
}

const chat = () => {
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const {user } =useGlobalContext();
  
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    setLoading(true);
    const result = await fetchchats();
    setChats(result);
    setLoading(false);  
  }
  
  
  const fetchchats = async () => {
    if(!user?.$id) return [];

    try {
      const {documents} = await databases.listDocuments(
        config.databaseId!,
        config.chatsCollectionId!,
        [
          Query.equal('participants', [user.$id]),
          Query.orderDesc('$createdAt'),
          Query.limit(100),
        ]
        );
        return documents as ChatRoom[];
    } catch (error) {
      console.log(error);
      return [];
    }
  }


  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await fetchchats();
    setChats(result);
    setRefreshing(false);
  }

  if(loading){
    return (
      <View className='flex flex-col items-center justify-center'>
        <ActivityIndicator className='size-6 text-primary-300'/>
        <Text className='mt-4 text-gray-400 font-rubik-medium text-lg'>Loading</Text>
      </View>
    )
  }

  if(chats.length === 0){
    return(
      <View className='flex-1 items-center justify-center p-4'>
        <Text className='text-gray-400 font-rubik text-lg'>No Chats</Text>
        <Text className='text-gray-400 font-rubik'>Start a conversation</Text>
      </View>
    )
  }
  return (
    <FlatList
     data={chats}
     keyExtractor={item => item.$id}
     refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor="#0061FF"/>}
     renderItem={({item}) => (
        <Link href={{
            pathname: '/chat/[id]',
            params: {
                id: item.$id
            }
        }}
        asChild
        >
           <TouchableOpacity>
            <ChatItem chatRoom={item} currentUserId={user?.$id!}/>
           </TouchableOpacity>
        </Link>
     )}
     contentInsetAdjustmentBehavior='automatic'
     contentContainerStyle={{padding: 8, gap: 2}}
    />
  )
}

const ChatItem = ({chatRoom, currentUserId}: chatProps) => {
  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffms = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffms / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if( diffMins < 1 ) return 'just now';
    if(diffMins < 60) return `${diffMins}m ago`;
    if(diffHrs < 24) return `${diffHrs} hrs ago`;
    if(diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <View className='p-4 bg-white rounded-xl shadow-sm shadow-black-100/70 mb-2 flex-row items-center gap-3 w-full'>
        <View className='relative'>
          {chatRoom.receiverAvatar ? (
            <Image 
            source={{uri: chatRoom.receiverAvatar}}
            className='w-14 h-14 rounded-full'
            resizeMode='cover'
            />
          ): (
            <View className='w-14 h-14 bg-gray-200 rounded-full items-center justify-center'>
               <GoPerson className='size-7 text-primary-300'/>
            </View>
          )}
        </View>

        <View className='flex-1'>
          <View className='flex-row items-center justify-between mb-1'>
            <Text className='text-black-300 font-rubik-bold text-base ' numberOfLines={1}>
              {chatRoom.title}
            </Text>
            <Text>
              {chatRoom.upDatedAt ? getTimeAgo(chatRoom.upDatedAt) : ''}
            </Text>
          </View>

        </View>
          <IoChevronForwardSharp className='size-5 text-primary-300'/>
      </View>
  )
}

export default chat