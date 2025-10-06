import { View, Text, SafeAreaView, Alert, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { useGlobalContext } from '@/lib/global-provider'
import { Redirect, router } from 'expo-router';
import { login, signUserUp } from '@/lib/appwrite';
import images from '@/constants/images';
import { FcGoogle } from "react-icons/fc";

const signUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refetch, loading, isLoggedIn } = useGlobalContext();

  if (!loading && isLoggedIn) return <Redirect href='/' />

  // Google OAuth signup
  const handleGoogleSignup = async () => {
    const result = await login();

    if (result) {
      refetch();
      console.log('Google signup successful!')
    } else {
      Alert.alert('Error', 'Something broke oops😞')
    }
  }

  // Email/Password signup
  const handleEmailSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signUserUp(email, password,name);

      if (result) {
        refetch();
        Alert.alert('Success', 'Account created successfully!');
        console.log('Email signup successful!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className='bg-white h-full'>
      <ScrollView contentContainerClassName='h-full'>
        <Image 
          source={images.onboarding}
          style={{
            width: '100%',
            height: '120%'
          }}
          resizeMode='contain' 
        />
        <View className='px-10'>
          <Text className='text-base text-center uppercase font-rubik text-black-200'>
            Welcome to LuxLiving
          </Text>
          <Text className='text-3xl font-rubik-bold text-black-300 text-center mt-2'>
            Create Your Account for {"\n"}
            <Text className='text-primary-300'>
              Your Dream Residence
            </Text>
          </Text>

          {/* Email/Password Form */}
          <View className='mt-8'>
            <Text className='text-lg font-rubik-medium text-black-200 mb-2'>
              Full Name
            </Text>
            <TextInput
              className='border border-black-100 rounded-lg px-4 py-3 font-rubik text-black-300 outline-none'
              placeholder='Enter your full name'
              value={name}
              onChangeText={setName}
              editable={!isSubmitting}
            />

            <Text className='text-lg font-rubik-medium text-black-200 mt-4 mb-2'>
              Email
            </Text>
            <TextInput
              className='border border-black-100 rounded-lg px-4 py-3 font-rubik text-black-300 outline-none'
              placeholder='Enter your email'
              value={email}
              onChangeText={setEmail}
              autoCapitalize='none'
              keyboardType='email-address'
              editable={!isSubmitting}
            />

            <Text className='text-lg font-rubik-medium text-black-100 mt-4 mb-2'>
              Password
            </Text>
            <TextInput
              className='border border-black-100 rounded-lg px-4 py-3 font-rubik text-black-300 outline-none'
              placeholder='Min 8 characters'
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isSubmitting}
            />

            <TouchableOpacity 
              onPress={handleEmailSignup} 
              className={`bg-primary-300 rounded-lg w-full py-1 mt-6 ${isSubmitting ? 'opacity-50' : ''}`}
              disabled={isSubmitting}
            >
              <Text className='text-center text-lg font-rubik-medium text-white'>
                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className='flex-row items-center my-6'>
            <View className='flex-1 h-[1px] bg-gray-300' />
            <Text className='mx-4 text-black-200 font-rubik'>OR</Text>
            <View className='flex-1 h-[1px] bg-gray-300' />
          </View>

          {/* Google Signup */}
          <Text className='text-lg font-rubik text-black-200 text-center'>
            Sign up with Google
          </Text>

          <TouchableOpacity 
            onPress={handleGoogleSignup} 
            className='bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-5'
          >
            <View className='flex flex-row items-center justify-center'>
              <FcGoogle className='w-6 h-6' />
              <Text className='text-center text-lg font-rubik-medium text-black-300 ml-2'>
                Sign up with Google
              </Text>
            </View>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className='flex-row justify-center mt-6'>
            <Text className='text-black-200 font-rubik'>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/sign-in')}>
              <Text className='text-primary-300 font-rubik-medium'>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default signUp