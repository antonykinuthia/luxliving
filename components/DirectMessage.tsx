import { View, Text, Alert, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { useGlobalContext } from '@/lib/global-provider';
import { config, databases } from '@/lib/appwrite';
import { ID, Query } from 'react-native-appwrite';
import { IoChatbubbleOutline } from 'react-icons/io5';


interface DirectMessageProps {
    targetId: string;
    targetName: string;
}
const DirectMessage = ({targetId, targetName}: DirectMessageProps) => {
    const router = useRouter();
    const {user} = useGlobalContext();

    const [isLoading, setIsLoading] = useState(false);

    const handleDirectMessage = async () =>{
        if(!user?.$id){
            console.error('User is not logged in');
            return;
        }

        if(user.$id === targetId){
            Alert.alert('You cannot direct message yourself 😅');
            return;
        }
        setIsLoading(true);

        try {
            const existingChat =await databases.listDocuments(
                config.databaseId!,
                config.chatsCollectionId!,
                [
                    Query.equal("participants", user.$id),
                    Query.equal("participants", targetId),
                    Query.limit(1)
                ]
            );
            if(existingChat.documents.length > 0){
                const chatId = existingChat.documents[0].$id;
                router.push(`/chat/${chatId}`);
                return;
            }
            const newChat = await databases.createDocument(
                config.databaseId!,
                config.chatsCollectionId!,
                ID.unique(),
                {
                   title: targetName,
                   participants: [user.$id, targetId],
                   lastMessage: new Date().toISOString(),
                   createdBy: user.$id, 
                }
            );

            router.push(`/chat/${newChat.$id}`)
        } catch (error) {
            console.error('error getting chat', error);
            alert('error getting chat');
        }finally{
            setIsLoading(false);
        }
    }
  return (
    <TouchableOpacity
     onPress={handleDirectMessage}
     disabled={isLoading}
     className='items-center justify-center w-10 h-10 bg-primary-300 rounded-full'
    >
        {isLoading ? (
            <ActivityIndicator className='text-primary-300'/>
        ): (
            <IoChatbubbleOutline className='text-white size-7'/>
        )}
    </TouchableOpacity>
  )
}

export default DirectMessage