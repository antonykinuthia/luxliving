import { 
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform, } from 'react-native'
import React, { useState, useEffect, useRef} from 'react'
import { sendMessage, getChats } from '@/lib/appwrite'
import { useGlobalContext } from '@/lib/global-provider'
import { useLocalSearchParams } from 'expo-router'


interface Message{
  $id: string,
  userId: string,
  message: string,
  createdAt: string
}

export const screenChats = () => {
    

    
    return (
      <View>
        <Text>[id]</Text>
      </View>
    )
  }
export const chats = ({item}: {item: Message}) => {
    const user = useGlobalContext();
    const { id } = useLocalSearchParams<{id?: string}>();
    
  return (
    <View>
      <Text>[id]</Text>
    </View>
  )
}
