import { View, Text, Image, Alert, TouchableOpacity, Modal, Pressable, ScrollView, TextInput, ActivityIndicator, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Tabs, router, useLocalSearchParams } from 'expo-router'
import icons from '@/constants/icons'
import { Link } from 'expo-router'
import { CiCirclePlus, CiVideoOn } from 'react-icons/ci'
import * as ImagePicker from 'expo-image-picker';
import * as videoThumbnails from 'expo-video-thumbnails';
import { useGlobalContext } from '@/lib/global-provider'
import { FACILITIES, PROPERTY_TYPES } from '@/constants/data'
import { uploadProperty, uploadReel } from '@/lib/appwrite'
import { IoCloseCircleOutline, IoHomeOutline, IoHomeSharp } from 'react-icons/io5'
import { MdOutlineErrorOutline, MdPlayCircle } from 'react-icons/md'
import { TiTickOutline } from 'react-icons/ti'
import { LiaMoneyBillWaveAltSolid } from 'react-icons/lia'
import { set, setISODay } from 'date-fns'

const TabIcon = ({ focused, icon, title}: {focused: boolean; icon:any; title: string}) => (
    <View className='flex-1 mt-3 flex-col items-center'>
        <Image source={icon} tintColor={focused ? '#0061FF' : '#666876'} resizeMode='contain' 
        style={{width: 24, height: 24}}
        />
        <Text className={`${focused ? 'text-primary-300 font-rubik-medium' : 'text-black-200 font-rubik'} text-xs w-full text-center mt-1`}>
            {title}
        </Text>
    </View>

)
const TabsLayout = () => {
    const {user} =useGlobalContext();
    const [createMenu, setCreateMenu] = useState(false);
    const [propertyModal, setPropertyModal] = useState(false)
    const [reelModal, setReelModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<string[]>([])
    const params = useLocalSearchParams<{ query?: string; filter: string }>();

    const  [generatingThumbnail, setGeneratingThumbnail] =useState(false)

    const [formData, setFormData] = useState({
        name: '',
        type: PROPERTY_TYPES[0],
        description: '',
        location: {
          city: '',
          county: '',
        },
        price: '',
        bedrooms: '',
        bathrooms: '',
        facilities: [] as string[],
        image: '',
        agentId: user?.$id || '',
    });

    const [reelData, setReelData]  = useState({
        description: '',
        price : '',
        location: '',
        username: user?.name || '',
        userId: user?.$id || '',
        video: '',
        thumbnail: '',
    })

    const handleCreateProperty = async () => {
        setCreateMenu(false);
        setPropertyModal(true);
    };

    const toggleFacility = (facility: string) => {
        setFormData(prev => ({
          ...prev,
          facilities: prev.facilities.includes(facility)
            ? prev.facilities.filter(f => f !== facility)
            : [...prev.facilities, facility]
        }));
      };

   

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        })

        if(!result.canceled){
            setFormData({...formData, image: result.assets[0].uri})
            Alert.alert('you have to select a property image first');
        }
    }

    const pickVideo = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: [ 'videos'],
                allowsEditing: true,
                quality: 0.8
            })

            if(!result.canceled){
               const videoUri = result.assets[0].uri
               setGeneratingThumbnail(true);
   
               try {
                   const thumbnailUri = await thumbNail(videoUri);
                   setReelData({...reelData, 
                       video: videoUri, 
                       thumbnail: thumbnailUri});
   
                   console.log('video picked', result.assets[0].uri);
                   
               } catch (error) {
                   console.error('Error generating thumbnail:', error);
                   setReelData({
                       ...reelData,
                       video: videoUri,
                       thumbnail: videoUri
                   })
               }finally{
                   setGeneratingThumbnail(false);
               }
            }
            
        } catch (error) {
           console.error('error picking video', error);
           setGeneratingThumbnail(false); 
        }
    }

    const thumbNail = async (videoUri:string): Promise<string> => {
        try {
            if(Platform.OS === 'web') {
                return new Promise((resolve, reject) => {
                    const video = document.createElement('video');
                    video.src = videoUri;
                    video.crossOrigin = 'anonymous';

                    video.addEventListener('loadeddata', () => {
                        video.currentTime = Math.min(1, video.duration * 0.1);
                    });

                    video.addEventListener('seeked', () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;

                        const ctx = canvas.getContext('2d');
                        if(ctx){
                            ctx.drawImage(video, 0, 0 , canvas.width, canvas.height);
                            resolve(canvas.toDataURL('image/jpeg', 0.8));
                        }else{
                            reject(new Error('Failed to get video data'))
                        }
                    });

                    video.addEventListener('error', () => {
                        reject(new Error('Failed to get video data'))
                    });
                    video.load();
                })
            } else{
                const {uri} = await videoThumbnails.getThumbnailAsync(videoUri, {
                    time: 1000,
                    quality: 0.8
                });
                return uri
            }
        } catch (error) {
            console.error('Error generating thumbnail:', error);
        }
    }

    const validateForm = () => {
        const newErrors: string[] = [];
    
        if (!formData.name.trim()) newErrors.push('Property name is required');
        if (!formData.description.trim()) newErrors.push('Description is required');
        if (!formData.location.city.trim()) newErrors.push('City is required');
        if (!formData.location.county.trim()) newErrors.push('County is required');
        if (!formData.price || parseFloat(formData.price) <= 0) newErrors.push('Valid price is required');
        if (!formData.bedrooms || parseInt(formData.bedrooms) <= 0) newErrors.push('Valid number of bedrooms is required');
        if (!formData.bathrooms || parseInt(formData.bathrooms) <= 0) newErrors.push('Valid number of bathrooms is required');
        if (!formData.image) newErrors.push('Property image is required');
        if (!formData?.agentId) newErrors.push('User not authenticated');
    
        setErrors(newErrors);
        return newErrors.length === 0;
      };

      const validateReel = () => {
        const newErrors: string[] = [];

        if(!reelData.description.trim()) newErrors.push('Description is required');
        if(!reelData.location.trim()) newErrors.push('Location is required');
        if (!reelData.price) newErrors.push('Price is required'); 
        if(!reelData.video.trim()) newErrors.push('Video is required');
        if(!reelData.username.trim()) newErrors.push('user name is required');
        if(!reelData.userId.trim()) newErrors.push('user is not authenticated');

        setErrors(newErrors);
        return newErrors.length === 0;
      }

      const handleCreateReel = () => {
        setCreateMenu(false);
        setReelModal(true);
    }

    const  handleSubmitReel = async () => {
        setErrors([]);
        setSuccess(false);

        if(!validateReel()){
            return
        }

        setIsLoading(true);

        try {
            const result = await uploadReel(reelData.video, reelData.description, reelData.location, reelData.price, reelData.username, reelData.userId);

            if(result.success && result.$id){
                setSuccess(true);
                Alert.alert('Success', 'Reel uploaded successfully!');

                setReelData({
                    description: '',
                    price : '',
                    video: '',
                    location: '',
                    username: user?.name || '',
                    userId: user?.$id || '',
                    thumbnail: ''
                })

                setTimeout(() => {
                    setReelModal(false);
                    setSuccess(false);
                }, 2000)
            }else{
                setErrors([result.error || 'Failed to upload reel']);
            }
        } catch (error) {
            console.error('error uploading reel', error);
        }finally{
            setSuccess(false);
        }
    }
      const handleSubmitProperty = async () => {
          setErrors([]);
          setSuccess(false);

          if(!validateForm()){
              return;
          }

          try {
            const result = await uploadProperty(formData);

            if(result.success){
                setSuccess(true);
                Alert.alert('Success', 'Property uploaded successfully!');
                setFormData({
                    name: '',
                    type: PROPERTY_TYPES[0],
                    description: '',
                    location: {
                      city: '',
                      county: '',
                    },
                    price: '',
                    bedrooms: '',
                    bathrooms: '',
                    facilities: [],
                    image: '',
                    agentId: user?.$id || '',
                });

                setTimeout(() => {
                    setPropertyModal(false);
                    setSuccess(false);
                })
            }else{
                setErrors([result.error || 'Failed to upload property']);
            }
          } catch (error) {
            console.log('error uploading property', error);
          } finally{
            setIsLoading(false);
          }
      }

      const closePropertyModal = () => {
          setPropertyModal(false);
          setSuccess(false);
          setErrors([]);
      }

      const isAgent = user?.name;

  return (
    <>
        <Tabs
        screenOptions={{
            tabBarShowLabel: false,
            tabBarStyle: {
                backgroundColor: 'white',
                position: 'absolute',
                borderTopColor: '#0061FF1A',
                borderTopWidth: 1,
                minHeight: 70
            }
        }}
        >
            <Tabs.Screen
            name='index'
            options={{
                title: 'Home',
                headerShown: false,
                tabBarIcon: ({focused}) => (
                    <TabIcon focused={focused} icon={icons.home} title="Home" />
                )
            }}
            />
            
            <Tabs.Screen
            name='explore'
            options={{
                title: 'Explore',
                headerShown: false,
                tabBarIcon: ({focused}) => (
                    <TabIcon focused={focused} icon={icons.search} title="Explore" />
                )
            }}
            />
            <Tabs.Screen
            name='create'
            options={{
                title: 'Create',
                headerShown: false,
                tabBarIcon: () => (
                <View className='flex-1 items-center justify-center '>
                    <View>
                        <CiCirclePlus className='size-6 text-white rounded-full bg-primary-300'/>
                    </View>
                    <Text>
                        Create
                    </Text>
                </View>
                ),
                tabBarButton: (props) => (
                    <TouchableOpacity
                    {...props}
                    onPress={(e) => {
                        e.preventDefault();
                        setCreateMenu(true)}}
                    />
                )
            }}
            
            />
            <Tabs.Screen
            name='chat'
            options={{
                title: 'Messages',
                headerShown: true,
                tabBarIcon: ({focused}) => (
                    <TabIcon focused={focused} icon={icons.chat} title="Chat" />
                ),
                headerRight: () => <Link href={'/chat/NewChat'} className=" rounded-full absolute top-0 right-0 p-1 m-4 z-10">
                    <CiCirclePlus className=' rounded-full mr-4 text-white size-6 bg-primary-300'/>
                </Link>
            }}
            />
            <Tabs.Screen
            name='profile'
            options={{
                title: 'Profile',
                headerShown: false,
                tabBarIcon: ({focused}) => (
                    <TabIcon focused={focused} icon={icons.person} title="Profile" />
                )
            }}
            />
        </Tabs>

        <Modal
        visible={createMenu}
        transparent
        animationType='fade'
        onRequestClose={() => setCreateMenu(false)}
        >
            <Pressable onPress={() => setCreateMenu(false)} className='flex-1 bg-black-300/50 justify-end'>
                <Pressable onPress={(e) => e.stopPropagation()} className='bg-white rounded-t-3xl'>
                    <View className='flex-row items-center justify-between p-5 border-b border-gray-100'>
                        <Text className='text-xl font-rubik-bold text-black-300'>
                            Create
                        </Text>
                        <TouchableOpacity onPress={() => setCreateMenu(false)} className='bg-gray-100 rounded-full p-1' activeOpacity={0.7}>
                            <IoCloseCircleOutline className='size-6 text-black-300'/>
                        </TouchableOpacity>
                    </View>

                    <View className='p-4'>
                        <TouchableOpacity className='flex-row items-center p-4 bg-gradient-to-r from-primary-100/20 to white roundex-2xl mb-3 border border-primary-100' 
                        onPress={handleCreateReel}
                        activeOpacity={0.7}>
                            <View className='bg-primary-300 rounded-full p-2'>
                                <CiVideoOn className='size-8 text-white'/>
                            </View>
                            <View className='ml-4 flex-1'>
                                <Text>Create Reel</Text>
                            </View>
                        </TouchableOpacity>

                        {isAgent &&(
                            <TouchableOpacity
                            onPress={handleCreateProperty}
                            className="flex-row items-center p-4 bg-gradient-to-r from-blue-50 to-white rounded-2xl mb-3 border border-blue-100"
                            activeOpacity={0.7}
                            >
                                <View className='bg-blue-500 rounded-full p-2'>
                                    <IoHomeSharp className='size-8 text-white'/>
                                </View>
                                <View className='ml-4 flex-1'>
                                    <Text className="text-lg font-rubik-bold text-black-300">Upload Property</Text>
                                    <Text className="text-sm text-gray-600 font-rubik mt-0.5">
                                    List a new property for sale/rent
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>

        <Modal 
        visible={propertyModal}
        animationType='slide'
        transparent
        onRequestClose={() => closePropertyModal}
        >
            <ScrollView className='flex-1 bg-white'>
                <View className='p-5'>
                    <View className="flex flex-row items-center justify-between mb-6">
                        <View  className="flex-row items-center gap-3">
                            <IoHomeOutline  className="flex-row items-center gap-3"/>
                            <Text className="text-2xl font-rubik-bold text-black-300">List Your Property</Text>
                        </View>
                        <Pressable onPress={closePropertyModal} className="bg-primary-300 rounded-full p-1">
                            <IoCloseCircleOutline className="size-6 text-white" />
                        </Pressable>
                    </View>

                    {errors.length > 0 && (
                        <View className="bg-red-50 rounded-lg p-3 mb-4">
                        {errors.map((error, index) => (
                          <View key={index} className="flex-row items-center gap-2 mb-1">
                            <MdOutlineErrorOutline className="size-5 text-red-600" />
                            <Text className="text-red-600 text-sm">{error}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {success && (
                        <View className="bg-green-50 rounded-lg p-3 mb-4 flex-row items-center gap-2">
                        <TiTickOutline className="size-6 text-green-600" />
                        <Text className="text-green-600 font-rubik-medium">Property Listed Successfully</Text>
                      </View>
                    )}

                    <TouchableOpacity
                    onPress={pickImage}
                    className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6 items-center justify-center h-48">
                        {formData.image ? (
                            <Image 
                            source={{uri: formData.image}}
                            className="absolute top-0 left-0 right-0 bottom-0 rounded-lg"
                            resizeMode="cover"
                            />
                        ): (
                            <View className="items-center">
                            <CiCirclePlus className="size-12 text-gray-400" />
                            <Text className="text-sm font-rubik-bold text-black-300 mt-2">Upload Property Photos</Text>
                            <Text className="text-xs font-rubik text-gray-500">Tap to select images</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View className="mb-4">
                        <Text className="text-sm font-rubik-semibold text-black-300 mb-2">Property Name</Text>
                        <TextInput
                            className="p-3 bg-gray-50 rounded-xl border border-gray-200"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Enter property name"
                            placeholderTextColor='#9ca3af'
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-rubik-semibold text-black-300 mb-2">Description</Text>
                        <TextInput
                            className="p-3 bg-gray-50 rounded-xl border border-gray-200"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="Enter property description"
                            placeholderTextColor='#9ca3af'
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    <View className="flex-row gap-3 mb-4">
                      <View className="flex-1">
                        <Text className="text-sm font-rubik-semibold text-black-300 mb-2">Price</Text>
                        <View className="rounded-xl border border-gray-200 bg-gray-50 flex-row items-center px-3">
                        <LiaMoneyBillWaveAltSolid className="size-5 text-primary-300" />
                        <TextInput
                            className="flex-1 p-3"
                            value={formData.price}
                            onChangeText={(text) => setFormData({ ...formData, price: text })}
                            placeholder="Monthly Price (KES)"
                            placeholderTextColor='#9ca3af'
                            keyboardType="numeric"
                        />
                     </View>
                    </View>  
                </View>

                <View className="flex-row gap-3 mb-4">
                    <View className="flex-1">
                        <Text className="text-sm font-rubik-semibold text-black-300 mb-2">Bedrooms</Text>
                        <View className="rounded-xl border border-gray-200 bg-gray-50 flex-row items-center px-3">
                        <Image source={icons.bed} className="size-5" />
                        <TextInput
                            className="flex-1 p-3"
                            value={formData.bedrooms}
                            onChangeText={(text) => setFormData({ ...formData, bedrooms: text })}
                            placeholder="Bedrooms"
                            placeholderTextColor='#9ca3af'
                            keyboardType="numeric"
                        />
                        </View>
                    </View>

                    <View className="flex-1">
                        <Text className="text-sm font-rubik-semibold text-black-300 mb-2">Bathrooms</Text>
                        <View className="rounded-xl border border-gray-200 bg-gray-50 flex-row items-center px-3">
                        <Image source={icons.bath} className="size-5" />
                        <TextInput
                            className="flex-1 p-3"
                            value={formData.bathrooms}
                            onChangeText={(text) => setFormData({ ...formData, bathrooms: text })}
                            placeholder="Bathrooms"
                            placeholderTextColor='#9ca3af'
                            keyboardType="numeric"
                        />
                        </View>
                    </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-rubik-semibold text-black-300 mb-2">City</Text>
                <View className="rounded-xl border border-gray-200 bg-gray-50 flex-row items-center px-3">
                    <Image source={icons.location} className="size-5" />
                    <TextInput
                    className="flex-1 p-3"
                    value={formData.location.city}
                    onChangeText={(text) => setFormData({
                        ...formData,
                        location: { ...formData.location, city: text }
                    })}
                    placeholder="Enter city"
                    placeholderTextColor='#9ca3af'
                    />
                </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-rubik-semibold text-black-300 mb-2">County</Text>
              <View className="rounded-xl border border-gray-200 bg-gray-50 flex-row items-center px-3">
                <Image source={icons.location} className="size-5" />
                <TextInput
                  className="flex-1 p-3"
                  value={formData.location.county}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    location: { ...formData.location, county: text }
                  })}
                  placeholder="Enter county"
                  placeholderTextColor='#9ca3af'
                />
              </View>
            </View>
            {FACILITIES && FACILITIES.length > 0 && (
                <View className='mb-4'>
                    <Text className="text-sm font-rubik-semibold text-black-300 mb-2">Facilities</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {FACILITIES.map((facility) => (
                            <TouchableOpacity
                            key={facility}
                            onPress={() => toggleFacility(facility)}
                            className={`px-4 py-2 rounded-full border ${
                                formData.facilities.includes(facility)
                                  ? 'bg-primary-300 border-primary-300'
                                  : 'bg-white border-gray-300'
                              }`}>
                                 <Text className={`text-sm ${
                                        formData.facilities.includes(facility)
                                        ? 'text-white font-rubik-medium'
                                        : 'text-gray-700 font-rubik'
                                    }`}>
                                        {facility}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            <TouchableOpacity className={`bg-primary-300 p-4 rounded-xl items-center mt-6 mb-6 ${isLoading ? 'opacity-70' : ''}`}
              onPress={handleSubmitProperty}
              disabled={isLoading}>
                {isLoading? (
                    <ActivityIndicator className="text-white" size='small'/>
                ) : (<Text className='text-white'>List Property</Text>)}
            </TouchableOpacity>
            </View>
            </ScrollView>
        </Modal>

        <Modal
        visible={reelModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setReelModal(false)}
        >
            <ScrollView showsVerticalScrollIndicator={false} className='flex-1'>

                <View className="flex-1 bg-white relative">
                    <View className="absolute top-3 right-4 z-50">
                        <Pressable 
                        onPress={() => 
                            setReelModal(false)
                        }
                        className="bg-primary-300 rounded-full p-2"
                        >
                        <IoCloseCircleOutline className="size-6 text-white" />
                        </Pressable>
                    </View>

                    <View className="flex-1  p-3 w-full">
                        <Text className="text-black-300 text-2xl font-rubik-bold mb-4">Create Reel</Text>

                        {errors.length > 0 && (
                            <View className="bg-red-50 rounded-lg p-3 mb-4">
                            {errors.map((error, index) => (
                            <View key={index} className="flex-row items-center gap-2 mb-1">
                                <MdOutlineErrorOutline className="size-5 text-red-600" />
                                <Text className="text-red-600 text-sm">{error}</Text>
                            </View>
                            ))}
                        </View>
                        )}

                    <TouchableOpacity
                        onPress={pickVideo}
                        className="bg-white border-2 border-dashed border-gray-300 rounded-xl mb-6 overflow-hidden"
                        style={{ height: 280 }}
                        disabled={generatingThumbnail}
                        activeOpacity={0.8}
                    >
                        {generatingThumbnail ? (
                            <View className="flex-1 items-center justify-center bg-gray-50">
                                <ActivityIndicator size="large" color="#0061FF" />
                                <Text className="text-sm text-gray-600 mt-3 font-rubik">
                                    Processing video...
                                </Text>
                            </View>
                        ) : reelData.video ? (
                            <View className="relative w-full h-full">
                                {/* Thumbnail Image */}
                                <Image
                            source={{ uri: reelData.thumbnail || reelData.video }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                        
                        {/* Overlay */}
                        <View className="absolute inset-0 bg-black/40 items-center justify-center">
                            <View className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                                <MdPlayCircle className="size-16 text-white" />
                            </View>
                        </View>
                        
                        {/* Change Button */}
                        <View className="absolute bottom-3 right-3 bg-white/95 px-4 py-2 rounded-full">
                            <Text className="text-xs font-rubik-bold text-primary-300">
                                Change Video
                            </Text>
                        </View>
                        
                        {/* Status Badge */}
                        <View className="absolute bottom-3 left-3 bg-black/70 px-3 py-1.5 rounded-full">
                            <Text className="text-white text-xs font-rubik-medium">
                                🎬 Video Ready
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View className="flex-1 items-center justify-center p-6">
                        <View className="bg-gray-100 rounded-full p-5 mb-4">
                            <CiCirclePlus className="size-12 text-gray-400" />
                            </View>
                            <Text className="text-base font-rubik-bold text-black-300 mb-2">
                                Select Property Video
                            </Text>
                            <Text className="text-sm font-rubik text-gray-500 text-center mb-3">
                                Tap to choose a video from your gallery
                            </Text>
                            <View className="flex-row items-center gap-2">
                                <View className="bg-blue-50 px-3 py-1 rounded-full">
                                    <Text className="text-xs font-rubik text-blue-600">
                                        📹 Max 60s
                                    </Text>
                                </View>
                                <View className="bg-green-50 px-3 py-1 rounded-full">
                                    <Text className="text-xs font-rubik text-green-600">
                                        📐 Vertical
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </TouchableOpacity>

                        <View className="mb-4">
                            <TextInput
                                className="p-3 bg-gray-50 rounded-xl border border-gray-200 w-full"
                                value={reelData.description}
                                onChangeText={(text) => setReelData({ ...reelData, description: text })}
                                placeholder="description"
                                placeholderTextColor='#9ca3af'
                            />
                        </View>
                        <View className="mb-4">
                            <TextInput
                                className="p-3 bg-gray-50 rounded-xl border border-gray-200 w-full"
                                value={reelData.location}
                                onChangeText={(text) => setReelData({ ...reelData, location: text })}
                                placeholder="location"
                                placeholderTextColor='#9ca3af'
                            />
                        </View>
                        <View className="mb-4">
                            <TextInput
                                className="p-3 bg-gray-50 rounded-xl border border-gray-200 w-full"
                                value={reelData.price}
                                onChangeText={(text) => setReelData({ ...reelData, price: text })}
                                placeholder="price"
                                placeholderTextColor='#9ca3af'
                            />
                        </View>

                        <TouchableOpacity className={`bg-primary-300 p-4 rounded-xl items-center mt-2 mb-6 ${isLoading ? 'opacity-70' : ''}`}
                            onPress={handleSubmitReel}
                            disabled={isLoading}>
                                {isLoading? (
                                    <ActivityIndicator className="text-white" size='small'/>
                                ) : (<Text className='text-white'>post reel</Text>)}
                        </TouchableOpacity>


                    </View>

            </View>
            </ScrollView>
        </Modal>
    </>
  )
}

export default TabsLayout