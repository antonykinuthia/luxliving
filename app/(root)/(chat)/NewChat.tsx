import { View, Text, Button } from 'react-native'
import React, { useState } from 'react'
import MessageInput from '@/components/MessageInput';
import { Stack, useRouter } from 'expo-router';
import { set } from 'date-fns';
import { config, databases, } from '@/lib/appwrite';
import { ID } from 'react-native-appwrite';


const NewChat = () => {
    const [roomName , setRoomName] = useState('');
    const [roomDesc , setRoomDesc] = useState('');
    const [isLoading , setIsLoading] = useState(false);
    const router = useRouter();

    const handleCreation = async () => {
        try {
            setIsLoading(true);
            await databases.createDocument(
                config.databaseId!,
                config.chatsCollectionId!,
                ID.unique(),
                {
                    title: roomName,
                    description: roomDesc,
                }
            )
            router.back();
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }
  return (
    <>
     <Stack.Screen
        options={{
         headerRight: () => (
             <Button
             title={isLoading ? 'Loading...' : 'Create'}
             disabled={roomName == '' || isLoading }
             onPress={handleCreation}
             />
         )
     }}
     />
        <View className='p-4 gap-4'>
        <Text>NewChat</Text>
        <MessageInput 
        value={roomName}
        placeholder='Room Name'
        onChangeText={setRoomName}
        maxLength={200}
        />
        <MessageInput 
        placeholder='Room Description'
        value={roomDesc}
        onChangeText={setRoomDesc}
        maxLength={500}
        style={{ height: 100 }}
        textAlignVertical='top'
        multiline
        />
        </View>
    </>
  )
}

export default NewChat