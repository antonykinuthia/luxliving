import { View, Text, TouchableOpacity, Image, Platform } from 'react-native'
import React from 'react'
import images from '@/constants/images'
import { CiStar, CiHeart } from "react-icons/ci";
import icons from '@/constants/icons';
import { Models } from 'react-native-appwrite';
import * as Haptics from 'expo-haptics';
import { User } from 'lucide-react';

interface Props {
    item: Models.Document;
    onPress?: () => void
}

interface InviteProps {
    name?: string;
    status?: 'pending' | 'joined' | 'invited';
    onPress?: () => void
}
export  const FeaturedCards = ({
    item: {image,item, rating, location, name, price}, onPress
}: Props) => (
    <TouchableOpacity onPress={onPress} className='flex flex-col items-start w-60 h-80 relative'>
        <Image source={{uri: image}} style={{ width: '100%', height: '100%', borderRadius: 16}}/>
        <Image source={images.cardGradient} style={{width: '100%', height: '100%', borderRadius: 16, position: 'absolute' , bottom:0}}/>

        <View className='flex flex-row items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-5'>
            <CiStar className='size-3.5 z-10'/>
            <Text className='text-sm font-rubik-bold text-primary-300 ml-1'>{rating}</Text>
        </View>

        <View className='flex flex-col items-start absolute bottom-5 inset-x-5'>
            <Text className='text-xl font-rubik-extra-bold text-white' numberOfLines={1}>
                {name}
            </Text>
            <Text className='text-base font-rubik text-white'>{location}, Kenya</Text>

            <View className='flex flex-row items-center justify-between w-full'>
                <Text numberOfLines={1} className='text-sm font-rubik-bold text-white'>
                    Ksh  {price* 130}
                </Text>
                <Image source={icons.heart} style={{
                    width: 24, height: 24
                }}/>
            </View>
        </View>
    </TouchableOpacity>
);


export const Cards = ({item: {image, rating, location, name, price}, onPress}: Props) => {
    return (
      <TouchableOpacity onPress={onPress} className='flex-1 w-full mt-4 px-3 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative'>
        <View className='flex flex-row items-center absolute px-2 top-5 right-5 bg-white/90 p-1 rounded-full z-50'>
              <CiStar className='size-2.5 z-10'/>
           <Text className='text-sm font-rubik-bold text-primary-300 ml-0.5'>{rating}</Text>
         </View>
  
         <Image source={{uri: image}} className='w-full' style={{
          height: 160, borderRadius: 8,
          width: '100%'
         }}/>
  
         <View className='flex flex-col mt-2'>
           <Text className='text-base font-rubik-bold text-black-300 ' >{name}</Text>
           <Text className='text-xs font-rubik text-black-200'>
              {location} ,Kenya
           </Text>
           <View className='flex flex-row items-center justify-between mt-2'>
              <Text numberOfLines={1} className='text-sm font-rubik-bold text-primary-300'>
                  ksh {price * 130}
              </Text>
              <Image source={icons.heart}
              style={{width:24, height: 24, marginRight: 2}}
              tintColor='#191d31'
              />
           </View>
           </View>
      </TouchableOpacity>
    )
  };  

  export const InvitationCard = ({name, status, onPress}: InviteProps) => {
    const triggerHaptic = () => {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const  handlePress = () => {
        triggerHaptic();
        if (onPress) {
            onPress();
        }
    }

    const getStatusColor = () => {
        switch (status) {
            case 'joined':
                return 'text-green-300';
            case 'pending':
                return '#FF9500';
            case 'invited':
                return '#0A84FF';
            default:
                return '#6B7280';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'joined':
                return 'Joined';
            case 'pending':
                return 'Pending';
            case 'invited':
                return 'Invited';
            default:
                return '';
        }
    }
    return(
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
            className='flex flex-row items-center gap-3 px-4 bg-white rounded-xl mb-2 shadow-sm shadow-black-100/70'>
            <View className='w-10 h-10 rounded-full bg-primary-300 flex items-center justify-center ml-3'>
                <User className='size-6 text-white'/>
            </View>

            <View className='flex-1 flex-row justify-between items-center'>
                <Text className='text-base font-rubik-bold'>{name || 'Friend'}</Text>
                <View className='px-4 py-2 rounded-lg'>
                    <Text className={`text-xs font-rubik-bold ${getStatusColor()}`}>{getStatusText()}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
  }

  export  const ListingCards = ({
    item: {image, item, rating, location, name, price}, onPress
}: Props) => (
    <TouchableOpacity onPress={onPress} className='flex flex-col items-start w-60 h-80 relative p-4'>
        <Image source={{uri: image}} style={{ width: '100%', height: '40%', borderRadius: 16}}/>

        {/* <View className='flex flex-row items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-5'>
            <CiStar className='size-3.5 z-10'/>
            <Text className='text-sm font-rubik-bold text-primary-300 ml-1'>{rating}</Text>
        </View> */}

        <View className='flex flex-col items-start absolute bottom-5 inset-x-5'>
            <Text className='text-xl font-rubik-extra-bold text-white' numberOfLines={1}>
                {name}
            </Text>
            <Text className='text-base font-rubik text-white'>{location}, Kenya</Text>

            <View className='flex flex-row items-center justify-between w-full'>
                <Text numberOfLines={1} className='text-sm font-rubik-bold text-white'>
                    Ksh  {price* 130}
                </Text>
            </View>
        </View>
    </TouchableOpacity>
);