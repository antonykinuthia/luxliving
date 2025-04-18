import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import images from '@/constants/images'
import { CiStar, CiHeart } from "react-icons/ci";
import icons from '@/constants/icons';
import { Models } from 'react-native-appwrite';

interface Props {
    item: Models.Document;
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