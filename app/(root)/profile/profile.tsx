import { useGlobalContext } from '@/lib/global-provider'
import { getProfileData } from '@/lib/appwrite'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { BiSolidEdit } from 'react-icons/bi'
import { IoIosArrowBack } from 'react-icons/io'
import { FlatList, SafeAreaView, View, Text, TouchableOpacity, Image, Pressable, ActivityIndicator } from 'react-native'

const profile = () => {
  const { user } = useGlobalContext()
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'properties' | 'reels'>('reels')

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      if (user?.$id) {
        const data = await getProfileData(user.$id)
        setProfileData(data)
        // Set default tab based on role
        if (data.role === 'agent') {
          setActiveTab('properties')
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditBio = () => {
    // Handle bio edit
  }

  const handleEditAvatar = () => {
    // Handle avatar edit
  }

  const renderGridItem = ({ item }: { item: any }) => {
    if (activeTab === 'properties') {
      return (
        <TouchableOpacity className='w-[48%] mb-4 bg-white rounded-lg shadow-sm'>
          <Image
            source={{ uri: item.image || item.images?.[0] }}
            className='w-full h-40 rounded-t-lg'
            resizeMode='cover'
          />
          <View className='p-2'>
            <Text className='font-rubik-bold text-sm' numberOfLines={1}>
              {item.name || item.title}
            </Text>
            <Text className='font-rubik text-xs text-black-200' numberOfLines={1}>
              ${item.price}
            </Text>
          </View>
        </TouchableOpacity>
      )
    } else {
      return (
        <TouchableOpacity className='w-[48%] mb-4 bg-white rounded-lg shadow-sm'>
          <Image
            source={{ uri: item.thumbnail || item.video }}
            className='w-full h-60 rounded-lg'
            resizeMode='cover'
          />
          <View className='absolute bottom-2 left-2'>
            <Text className='font-rubik-bold text-white text-xs bg-black/50 px-2 py-1 rounded'>
              {item.views || 0} views
            </Text>
          </View>
        </TouchableOpacity>
      )
    }
  }

  if (loading) {
    return (
      <SafeAreaView className='flex-1 justify-center items-center'>
        <ActivityIndicator size='large' color='#0061FF' />
      </SafeAreaView>
    )
  }

  const currentData = activeTab === 'properties' 
    ? (profileData?.properties || []) 
    : (profileData?.reels || [])

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <FlatList
        data={currentData}
        keyExtractor={(item, index) => item.$id || index.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
        renderItem={renderGridItem}
        ListHeaderComponent={() => (
          <View className='flex flex-col flex-1 mt-4 mb-6'>
            <View className='flex flex-row gap-20 items-center'>
              <TouchableOpacity 
                onPress={() => router.back()} 
                className='bg-primary-200 rounded-full size-8 items-center justify-center ml-2'
              >
                <IoIosArrowBack className='size-4' />
              </TouchableOpacity>
              <Text className='text-2xl font-rubik-bold'>My Profile</Text>
            </View>

            <View className='mt-2 justify-center flex flex-col relative'>
              <View className='flex flex-col items-center relative mt-5'>
                <Image
                  source={{ uri: user?.avatar }}
                  className='w-16 h-16 rounded-full relative'
                />
                <TouchableOpacity 
                  onPress={handleEditAvatar} 
                  className='absolute bottom-1 right-28'
                >
                  <BiSolidEdit className='size-6 rounded-full text-black-200' />
                </TouchableOpacity>
              </View>

              <View className='justify-center items-center mt-4'>
                <Text className='text-2xl font-rubik-bold'>{user?.name}</Text>
                <Pressable onPress={handleEditBio}>
                  <Text className='text-sm font-rubik text-black-200'>
                    This is the users bio
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Tabs */}
            <View className='flex flex-row mt-6 border-b border-black-100'>
              {profileData?.role === 'agent' && (
                <TouchableOpacity
                  onPress={() => setActiveTab('properties')}
                  className={`flex-1 py-3 ${
                    activeTab === 'properties' ? 'border-b-2 border-primary-300' : ''
                  }`}
                >
                  <Text
                    className={`text-center font-rubik-medium ${
                      activeTab === 'properties' ? 'text-primary-300' : 'text-black-200'
                    }`}
                  >
                    Properties ({profileData?.properties?.length || 0})
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setActiveTab('reels')}
                className={`flex-1 py-3 ${
                  activeTab === 'reels' ? 'border-b-2 border-primary-300' : ''
                }`}
              >
                <Text
                  className={`text-center font-rubik-medium ${
                    activeTab === 'reels' ? 'text-primary-300' : 'text-black-200'
                  }`}
                >
                  Reels ({profileData?.reels?.length || 0})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className='flex-1 justify-center items-center py-20'>
            <Text className='font-rubik text-black-200'>
              No {activeTab} yet
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

export default profile