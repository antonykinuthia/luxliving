import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { ChatRooms } from '@/utils/test-data'
import { useState } from 'react'
import { Link, usePathname,useLocalSearchParams } from 'expo-router'
import { ChatRoom } from '@/utils/types'
import { databases,config } from '@/lib/appwrite'
import { Query } from 'react-native-appwrite'
import { set } from 'date-fns'

const chat = () => {
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const pathname = usePathname()
  const { chat } = useLocalSearchParams();

  useEffect(() => {
    fetchchats()
  }, [])

  const fetchchats = async () => {
    try {
      const {documents, total} = await databases.listDocuments(
        config.databaseId!,
        config.chatsCollectionId!,
        [
          Query.limit(100),
        ]
        )
        console.log(JSON.stringify(documents, null, 2), total);
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
     data={ChatRooms}
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
            title={item.title} 
            description={item.description}
             />
        </Link>
     )}
     contentInsetAdjustmentBehavior='automatic'
     contentContainerStyle={{padding: 16, gap: 16}}
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
      <Text className='text-lg '>{title}</Text>
    </View>
  )
}

const ItemDescription = ({description,title}: {
  description: string,
  title: string
})=>{
  return (
    <TouchableOpacity className='gap-2'>
      <ItemList title={title}/>
      <Text className='text-rubik-medium text-gray-500'>{description}</Text>
    </TouchableOpacity>
  )
}

export default chat