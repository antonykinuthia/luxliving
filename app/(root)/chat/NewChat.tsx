 import MessageInput from '@/components/MessageInput';
import { config, databases } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { Stack, useRouter } from 'expo-router';
import React, {useState} from 'react'
import { IoIosArrowBack } from 'react-icons/io';
import { Text, TouchableOpacity, View, Alert } from 'react-native';
import { ID } from 'react-native-appwrite';
 
interface newChatProps {
    targetId: string;
    targetName: string;
}
 const NewChat = ({targetId, targetName}: newChatProps) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const {user} = useGlobalContext();

    const handleCreation = async () =>{
        if(!user?.$id){
            alert('User is not logged in');
            return;
        }

        try {
            setLoading(true);

            const newChat = await databases.createDocument(
                config.databaseId!,
                config.chatsCollectionId!,
                ID.unique(),
                {
                    title: name.trim() || targetName ,
                    participants: [user.$id, targetId],
                    lastMessage: new Date().toISOString(),
                    createdBy: user.$id
                }
            );

            router.replace(`/chat/${newChat.$id}`);
        } catch (error) {
            console.error('Error creating chat:', error);
            Alert.alert('failed to create chat');
        } finally{
            setLoading(false);
        }
    }
   return (
     <>
       <Stack.Screen
        options={{
            title: 'Create New Chat',
            headerRight: () =>(
                <View className='mr-2'>
                    <TouchableOpacity onPress={handleCreation} disabled={name.trim() === '' || loading} className=' items-center gap-2 bg-primary-300 rounded-xl px-4 py-2'>
                        <Text className='text-white font-rubik-light'>{loading ?'creating...' : 'Create'}</Text>
                    </TouchableOpacity>
                </View>
            ),
            headerLeft: () => (
                <TouchableOpacity onPress={() => router.push('/chat')}  className=" bg-primary-200 rounded-full size-8 items-center justify-center ml-2">
                    <IoIosArrowBack className='size-4'/>
                </TouchableOpacity>
            )
        }}
       />
       <View className='flex-1 p-4 gap-4 bg-white'>
        <View className='gap-2'>
            <Text className='text-lg font-rubik-regular'>Chat with:{targetName}</Text>
        </View>

        <View className='gap-4 mt-2'>
            <View>
               <Text className='font-rubik-medium mb-2'>Name</Text> 
               <MessageInput
                value={name}
                placeholder='Chat with'
                onChangeText={setName}
                maxLength={200}
                className='p-20'
               />
            </View>
        </View>
       </View>
     </>
   )
 }
 
 export default NewChat