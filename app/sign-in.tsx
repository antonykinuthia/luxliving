import { View, Text, SafeAreaView, Alert, ScrollView, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useGlobalContext } from '@/lib/global-provider'
import { Redirect } from 'expo-router';
import { login } from '@/lib/appwrite';
import images from '@/constants/images';
import { FcGoogle } from "react-icons/fc";

const signIn = () => {
    const {refetch, loading, isLoggedIn} = useGlobalContext();

    if(!loading && isLoggedIn) return <Redirect href='/'/>

    const handleLogin = async() => {
        const result = await login();

        if(result){
            refetch();
            console.log('hooray we Cooking now')
        }else {
            Alert.alert('something broke oops😞')
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
               let's Get You Closer to {"\n"}
               <Text className='text-primary-300'>
               Your Dream Residence
               </Text>
            </Text>

            <Text className='text-lg font-rubik text-black-200 text-center mt-12'>
              Login to LuxLiving with Google
            </Text>

            <TouchableOpacity onPress={handleLogin} className='bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-5'>
              <View className='flex flex-row items-center justify-center'>
                <FcGoogle className='w-6 h-6'/>
                <Text className='text-center text-lg font-rubik-medium text-black-300 ml-2'>Login with Google</Text>
              </View>
            </TouchableOpacity>
           </View>
     </ScrollView>
    </SafeAreaView>
  )
}

export default signIn 