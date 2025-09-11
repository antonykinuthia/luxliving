import { View, Text, Platform, SafeAreaView,TouchableOpacity,ScrollView } from 'react-native'
import { Copy, Share2, Mail, MessageCircle, Twitter } from 'lucide-react-native';
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { FaSquareXTwitter } from "react-icons/fa6"


const page = () => {
 const router = useRouter();
 const [copied, setCopied] = useState(false);

 const referralCode = "a1b2c3d4";
 const referralLink = `https://example.com/invite/${referralCode}`;

 const triggerHaptic = () => {
     if(Platform.OS === 'ios') {
         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
     }
 }; 

 const copyToClipboard = async () => {
     triggerHaptic();
     await Clipboard.setStringAsync(referralLink);
     setCopied(true);
     setTimeout(() => {
         setCopied(false);
     }, 2000);
 }

 const shareInvite = async () => {
     triggerHaptic();
     if(Platform.OS === 'ios') {
         try{
            await Sharing.shareAsync(referralLink);
         } catch (error) {
             console.log(error);
         }
     }else {
        if( navigator.share){
            try{
                await navigator.share({
                    title: 'Join My App',
                    text: 'Check out this app and join me!',
                    url: referralLink
                });
            } catch (error) {
                console.error("Error Sharing:",error);
            }
        } else{
            copyToClipboard();
        }
     }
 }
  return (
    <SafeAreaView className='flex-1 bg-white/20'>
     <ScrollView>

            <View className='px-5 py-4'>
                <Text className='text-2xl font-rubik-bold text-black-300'>
                    Invite Friends
                </Text>
                <Text className='text-base font-rubik text-black-200 mt-2'>
                    Invite your friends and family to join the app and earn a reward.
                </Text>
            </View>

        <View className="mx-5 p-5 bg-blue-50 rounded-xl">
            <View className="flex-row items-center justify-between">
            <View className="flex-1">
                <Text className="text-xl font-semibold text-primary-dark">Earn Rewards</Text>
                <Text className="text-sm text-neutral-700 mt-1">
                For every friend that joins using your referral, you both get 500 points!
                </Text>
            </View>
            <View className="w-16 h-16 bg-primary rounded-full items-center justify-center">
                <Text className="text-white font-rubik-bold text-xl">500</Text>
            </View>
            </View>
        </View>

        <View className="mx-5 mt-6">
            <Text className="text-sm font-medium text-neutral-500 mb-2">YOUR REFERRAL CODE</Text>
            <View className="flex-row items-center">
            <View className="flex-1 bg-neutral-100 p-4 rounded-l-lg">
                <Text className="text-lg font-mono font-semibold text-neutral-800">{referralCode}</Text>
            </View>
            <TouchableOpacity 
                className={`p-4 rounded-r-lg ${copied ? 'bg-secondary' : 'bg-primary'}`}
                onPress={copyToClipboard}
                activeOpacity={0.8}
            >
                {copied ? (
                <Text className="text-white font-medium">Copied!</Text>
                ) : (
                <Copy color="white" size={20} />
                )}
            </TouchableOpacity>
            </View>
        </View>
        
        <View className="mx-5 mt-8">
            <Text className="text-lg font-semibold text-neutral-800 mb-4">Share via</Text>
            
            <TouchableOpacity 
            className="flex-row items-center bg-primary p-4 rounded-lg mb-3"
            onPress={shareInvite}
            activeOpacity={0.8}
            >
            <Share2 color="white" size={22} />
            <Text className="text-white font-medium ml-3">Share with friends</Text>
            </TouchableOpacity>
            
            {/* Sharing options */}
            <View className="flex-row justify-between mt-2">
            <TouchableOpacity 
                className="items-center justify-center w-20 h-20 bg-blue-50 rounded-xl"
                onPress={triggerHaptic}
                activeOpacity={0.8}
            >
                <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mb-1">
                <MessageCircle color="white" size={20} />
                </View>
                <Text className="text-xs text-neutral-700">Message</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                className="items-center justify-center w-20 h-20 bg-red-50 rounded-xl"
                onPress={triggerHaptic}
                activeOpacity={0.8}
            >
                <View className="w-10 h-10 bg-red-500 rounded-full items-center justify-center mb-1">
                <Mail color="white" size={20} />
                </View>
                <Text className="text-xs text-neutral-700">Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                className="items-center justify-center w-20 h-20 bg-sky-50 rounded-xl"
                onPress={triggerHaptic}
                activeOpacity={0.8}
            >
                <View className="w-10 h-10 bg-sky-500 rounded-full items-center justify-center mb-1">
                <FaSquareXTwitter  className="size-5 text-white"/>
                </View>
                <Text className="text-xs text-neutral-700">X</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                className="items-center justify-center w-20 h-20 bg-neutral-100 rounded-xl"
                onPress={copyToClipboard}
                activeOpacity={0.8}
            >
                <View className="w-10 h-10 bg-neutral-600 rounded-full items-center justify-center mb-1">
                <Copy color="white" size={20} />
                </View>
                <Text className="text-xs text-neutral-700">Copy Link</Text>
            </TouchableOpacity>
            </View>
        </View>
        
        {/* Friend status */}
        <View className="mx-5 mt-8">
            <Text className="text-lg font-semibold text-neutral-800 mb-3">Invitation Status</Text>
            <View className="bg-neutral-100 rounded-lg p-4">
            <Text className="text-neutral-500 text-center">
                No friends have joined yet. Share your code to get started!
            </Text>
            </View>
        </View>
     </ScrollView>
    </SafeAreaView>
  )
}

export default page