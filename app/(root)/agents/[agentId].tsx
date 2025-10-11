import { View, Text, SafeAreaView, TouchableOpacity, Image, ActivityIndicator, FlatList } from 'react-native'
import React,{useState} from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { useAppwrite } from '@/lib/useAppwrite'
import { getAgentWithProperties } from '@/lib/appwrite'
import NoResults from '@/components/NoResult'





const agent = () => {
    const {agentId} = useLocalSearchParams<{agentId: string}>();

    const {data: getAgentProperties, loading, refetch} = useAppwrite({
        fn: getAgentWithProperties,
        params:{
            agentId: agentId
        }
    })

    if (loading){
        return(
            <ActivityIndicator size='large' className="text-primary-300 mt-5"/>
        )
    }
    const renderProperty = ({ item }: { item: any } ) => (
        
        <TouchableOpacity onPress={() => handleCardPress(item.$id)} className='flex flex-col items-start w-75 h-80 relative p-4 rounded-lg bg-white shadow-lg shadow-black-100/70 mb-5'>
             {item.image ? (
                <Image 
                    source={{ uri: item.image }} 
                    style={{ width: '100%', height: '50%', borderRadius: 16}}
                    resizeMode="cover"
                    onError={(error) => {
                        console.log('Image failed to load:', item.image);
                        console.log('Error details:', error);
                    }}
                />
            ) : (
                <View className="w-full h-48 bg-gray-200 rounded-lg mb-3 justify-center items-center">
                    <Text className="text-gray-500">No Image</Text>
                </View>
            )}
            
            {/* Property Details */}
            <View className='absolute bottom-5 items-start inset-x-5 mt-2'>
                <Text className="font-rubik-extra-bold text-xl text-black-300 mb-2" numberOfLines={1}>{item.name}</Text>
                <Text className="text-black-200 mb-1 text-base">{item.location}, Kenya</Text>
                <Text className="font-rubik-semibold text-sm text-primary-300  mb-2">
                    ksh: {item.price * 130}
                </Text>

            </View>
            

        </TouchableOpacity>
    );
    const handleCardPress = (id:string) => router.push(`/properties/${id}`);
  return (
    <SafeAreaView className='p-4 flex-1'>
        <FlatList
        data={getAgentProperties?.properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.$id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
            <View>
                <View className='flex flex-row items-center w-full gap-10'>
                    <TouchableOpacity 
                    onPress={() => router.back()}
                    className="flex flex-row bg-primary-200 rounded-full size-10 items-center justify-center"
                    >
                        <IoIosArrowRoundBack className='size-5 '/>
                    </TouchableOpacity>
                    <Text className='font-rubik-bold text-xl text-center'>
                        Agent Profile
                    </Text>
                </View>
                <View  className='flex flex-row mt-5 gap-4'>
                    <Image 
                    source={{uri: getAgentProperties?.agent?.avatar}}
                    style={{width: 70, height: 70, borderRadius: 50}}
                    />
                <View>
                    <Text className='font-rubik-semibold text-2xl'>
                       {getAgentProperties?.agent?.name}
                    </Text>
                    <Text className='text-black-200 font-rubik-light'>Real Estate Agent</Text>
                    <Text className='text-black-200 font-rubik-light'> 5 Years Experience</Text>
                    <Text className='text-black-300 font-rubik-medium'> {getAgentProperties?.agent?.email}</Text>
                </View>
            </View>
                <View className='mt-6 flex flex-row gap-2'>
                    <TouchableOpacity className='bg-primary-300 rounded-xl py-3 px-3 w-1/2' onPress={() => router.push(`/chat/${getAgentProperties?.agent?.$id}`)}>
                        <Text className='font-rubik-semibold text-white text-center text-sm'>
                            Message
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity className='bg-property-100 rounded-xl py-3 px-3 w-1/2'>
                        <Text className='font-rubik-semibold text-black-300 text-center text-sm'>
                            Call
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className='mt-6'>
                    <Text className='font-rubik-semibold text-black-300 '>
                        About
                    </ Text>
                    <Text className=' text-black-200 mt-2'>
                        John Doe is a seasoned real Estate agent with a passion for helping clients find their dream home. With a deep understanding of the real estate market and a commitment to customer satisfaction, John Doe is dedicated to providing exceptional service to his clients.
                    </Text>
                </View>

                <View className='mt-6 mb-5'>
                    <Text className='font-rubik-bold text-xl'>
                        Active Listings: { getAgentProperties?.properties?.length}
                       
                    </Text>
                </View>
            </View>
        )}
        ListEmptyComponent={() => (
            loading ? (
                <ActivityIndicator size='large' className="text-primary-300 mt-5"/>
              ): <NoResults/>
        )}
        />

    </SafeAreaView>
  )
}

export default agent