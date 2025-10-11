import { View, Text, SafeAreaView, Alert, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { useGlobalContext } from '@/lib/global-provider'
import { Redirect, router } from 'expo-router';
import { login, signUserIn } from '@/lib/appwrite';
import images from '@/constants/images';
import { FcGoogle } from "react-icons/fc";
import { set } from 'date-fns';

const signIn = () => {
    const [ email, setEmail] =  useState('');
    const [password , setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {refetch, loading, isLoggedIn} = useGlobalContext();

    if(!loading && isLoggedIn) return <Redirect href='/'/>


    const handleEmailLogIn = async() => {
      if(!email || !password) return Alert.alert('Please fill all the fields');
      setIsSubmitting(true);

      try {
        const response = await signUserIn(email, password);

        if(response){
          refetch();
          console.log('hooray we are Cooking now')
        }else{
          Alert.alert('something broke oops😞')
        }
      } catch (error) {
          console.error(error);
      }finally {
        setIsSubmitting(false);
      }
    }
  return (
    <SafeAreaView className='bg-white h-full'>
     <ScrollView contentContainerClassName='h-full'>
       <Image source={images.onboarding}
       style={{
        width: '100%',
        height: '120%'
       }}
       resizeMode='contain'/>
       <View className='px-10'>
            <Text className='text-base text-center uppercase font-rubik text-black-200'>
              Welcome to LuxLiving
            </Text>
            <Text className='text-3xl font-rubik-bold text-black-300 text-center mt-2'>
               Sign In to continue
            </Text>

            <View className='mt-8'>
              <Text className='text-lg font-rubik text-black-200 mb-1'>
                Email
              </Text>
              <TextInput
              className='border border-black-100 rounded-lg px-4 py-2 mt-1 outline-none'
              placeholder='Enter your email'
              value={email}
              onChangeText={setEmail}
              autoCapitalize='none'
              keyboardType='email-address'
              editable={!isSubmitting}
              />
              <Text className='text-lg font-rubik text-black-200 mb-2 mt-4'>
                Password
              </Text>
              <TextInput
              className='border border-black-100 rounded-lg px-4 py-3 font-rubik text-black-300 outline-none'
              placeholder='Enter your password'
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isSubmitting}
              />
              <TouchableOpacity 
              onPress={handleEmailLogIn} 
              className={`bg-primary-300 rounded-lg w-full py-1 mt-6 ${isSubmitting ? 'opacity-50' : ''}`}
              disabled={isSubmitting}
            >
              <Text className='text-center text-lg font-rubik-medium text-white'>
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
            <View className='items-end mt-2'>
              <TouchableOpacity className='w-1/3' onPress={() => console.log('forgot password')}>
                <Text className='text-primary-300 text-sm underline'> forgot password</Text>
              </TouchableOpacity>
            </View>
            </View>
           </View>
     </ScrollView>
    </SafeAreaView>
  )
}

export default signIn 