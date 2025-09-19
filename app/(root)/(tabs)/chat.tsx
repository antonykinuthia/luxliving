import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { ChatRooms } from '@/utils/test-data'
import { useState } from 'react'
import { Link, usePathname,useLocalSearchParams } from 'expo-router'
import { ChatRoom } from '@/utils/types'
import { databases,config } from '@/lib/appwrite'
import { Query } from 'react-native-appwrite'
import { IoChevronForwardSharp } from "react-icons/io5";
import { useAppwrite } from '@/lib/useAppwrite'
import { set } from 'date-fns'
import images from '@/constants/images'

 interface chatProps {
  description: string,
  title: string,
  image?: string|number
}

const chat = () => {
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const pathname = usePathname()
  const { chat } = useLocalSearchParams();
  
  useEffect(() => {
    const loadChats = async () => {
      const result = await fetchchats();
      setChats(result);   // <-- this updates your state
    };
  
    loadChats();
  }, []);
  
  
  const fetchchats = async () => {
    try {
      const {documents, total} = await databases.listDocuments(
        config.databaseId!,
        config.chatsCollectionId!,
        [
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
    try{
      setRefreshing(true);
      await fetchchats();
    }catch(error){
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  }
  return (
    <FlatList
     data={chats}
     keyExtractor={item => item.$id}
     refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefresh} />}
     renderItem={({item}) => (
        <Link href={{
            pathname: '/[chat]',
            params: {
                chat: item.$id
            }
        }}
        className='p-3 bg-black-100 rounded-lg'
        >
            <ItemDescription 
            image={item.imageUrl}
            title={item.title} 
            description={item.description}
             />
        </Link>
     )}
     contentInsetAdjustmentBehavior='automatic'
     contentContainerStyle={{padding: 16, gap: 2}}
    />
  )
}

const ItemList = ({
  title
} : {
  title: string
}) => {
  return (
    <View className='flex-row items-center gap-1'>
      <Text className='text-lg text-black-300 font-rubik-bold'>{title}</Text>
    </View>
  )
}

const ItemDescription = ({description,title, image}: chatProps)=>{
  const imageSource = typeof image === 'string' ? {uri: image} : image;
  
  return (
    <TouchableOpacity className='gap-2 flex flex-row justify-between items-center'>
      {/* <Image 
        source={imageSource} 
        className='w-12 h-12 rounded-lg'
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
        }}
        // resizeMode="cover"
      /> */}
     <View className='flex-col'>
      <ItemList title={title}/>
      <Text className='text-rubik-medium text-gray-500'>{description}</Text>

     </View>
      <IoChevronForwardSharp  className='text-primary-300 size-6'/>
    </TouchableOpacity>
  )
}

export default chat