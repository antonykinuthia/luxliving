import { Button, Text, TouchableOpacity, View, FlatList, Image, ActivityIndicator, Modal,Pressable,ScrollView, TextInput, } from "react-native";
import { useEffect, useState } from "react";
import { GoBell } from "react-icons/go";
import Search from "@/components/Search";
import Filters from "@/components/Filters";
import { useLocalSearchParams, router } from "expo-router";
import { useAppwrite } from "@/lib/useAppwrite";
import { getLatestProperties, getProperties, UploadProperty, validatePropertyData } from "@/lib/appwrite";
import * as ImagePicker from 'expo-image-picker';

import { useGlobalContext } from "@/lib/global-provider";
import { Cards, FeaturedCards } from "@/components/Cards";
import NoResults from "@/components/NoResult";
import { CiCirclePlus } from "react-icons/ci";
import { IoCloseCircleOutline } from "react-icons/io5";
import images from "@/constants/images";
import { FACILITIES,KENYAN_LOCATIONS, PROPERTY_TYPES } from "@/constants/data";
import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineErrorOutline } from "react-icons/md";
import { TiTickOutline } from "react-icons/ti";
import { LiaMoneyBillWaveAltSolid } from "react-icons/lia";
import { ChartArea } from "lucide-react";
import icons from "@/constants/icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";




export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: PROPERTY_TYPES[0],
    description: '',
    location: KENYAN_LOCATIONS[0],
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    isRental: false,
    facilities: [FACILITIES[0]],
    image: '',
    agentId: 'default-agent',
  });


  const params = useLocalSearchParams<{query?: string; filter: string}>();
  const user = useGlobalContext();
  const { data: latestProperties, loading: latestPropertiesLoading} = useAppwrite({
    fn: getLatestProperties
  }); 

  const {data: properties, loading, refetch} = useAppwrite({
    fn: getProperties,
    params: {
      filter: params.filter!,
      query: params.query!,
      limit: 6
    }, 
    skip: true,
  });

  useEffect(() => {
    refetch( {
      filter: params.filter!,
      query: params.query!,
      limit: 6
    });
  }, [params.filter, params.query]);

  const handleCardPress = (id:string) => router.push(`/properties/${id}`);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if( status !== 'granted') {
      setErrors(['Permission to access media library is required.']);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8
    });

    if(!result.canceled) {
      setFormData({...formData, image: result.assets[0].uri});
    }
  };

const handleClose = () => {
  setIsOpen(!isOpen);
}
  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors([]);
    setSuccess(false);

    const numericFormData = {
      ...formData,
      price: Number(formData.price),
      area: Number(formData.area),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
    };

    const { isValid, errors: validationErrors } = validatePropertyData(numericFormData);

    if (!isValid) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    const result = await UploadProperty(numericFormData);

    if (result?.success) {
      setSuccess(true);
      setFormData({
        name: '',
        type: PROPERTY_TYPES[0],
        description: '',
        location: KENYAN_LOCATIONS[0],
        price: '',
        area: '',
        bedrooms: '',
        bathrooms: '',
        isRental: false,
        facilities: [FACILITIES[0]],
        image: '',
        agentId: 'default-agent',
      });
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      setErrors(['Failed to upload property. Please try again.']);
    }

    setIsLoading(false);
  };

  return (
    <SafeAreaProvider>
        <SafeAreaView className="bg-white h-full relative">
          <FlatList
          data={properties}
          renderItem={({item}) => <Cards item={item} onPress={() => handleCardPress(item.$id)}/>}
          keyExtractor={(item) => item.$id}
          numColumns={2}
          contentContainerClassName="pb-32"
          columnWrapperClassName="flex gap-5 px-5"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator size='large' className="text-primary-300 mt-5"/>
            ): <NoResults/>
          }
          ListHeaderComponent={
            <View className="px-5">
              <View className="flex flex-row justify-between items-center mt-5">
                <View className="flex flex-row items-center">
                  <Image source={images.avatar} className="size-12 rounded-full"/>
                  {/* <Image source={{uri: user?.avatar}} className="size-12 rounded-full"/> */}
                  <View className="flex flex-col items-start ml-2 justify-center">
                    <Text className="text-xs font-rubik text-black-100">welcome</Text>
                    <Text className="text-base font-rubik-medium text-black-300">1764</Text>
                    {/* <Text className="text-base font-rubik-medium text-black-300">{user?.name}</Text> */}
                  </View>
                </View>
                <GoBell className="size-6"/>
                {/* TODO implement notifications  */}
              </View>
                <Search/>

                <View className="my-5">
                  <View className="flex flex-row items-center justify-between">
                      <Text className="text-xl font-rubik-bold text-black-300">Featured</Text>
                      <TouchableOpacity onPress={() => router.push('/explore')}>
                        <Text className="text-base font-rubik-bold text-primary-300">See All</Text>
                      </TouchableOpacity>
                  </View>
                  {latestPropertiesLoading? <ActivityIndicator size='large' className="text-primary-300"/> : !latestProperties || latestProperties.length === 0 ? <NoResults/> :(
                    <FlatList 
                    data={latestProperties}
                    renderItem={({item}) => <FeaturedCards item={item} onPress={() => handleCardPress(item.$id)}/>}
                    keyExtractor={(item) => item.$id}
                    horizontal
                    bounces={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="flex gap-5 mt-5"
                    />
                  ) }
                </View>

                <View className="flex flex-row items-center justify-between">
                      <Text className="text-xl font-rubik-bold text-black-300">Recommendations</Text>
                      <TouchableOpacity onPress={() => router.push('/explore')}>
                        <Text className="text-base font-rubik-bold text-primary-300">See All</Text>
                      </TouchableOpacity>
                  </View> 

                  <Filters/>

            </View>
          } 
          />

        </SafeAreaView>
          <TouchableOpacity onPress={() => setIsOpen(true)} className="bg-primary-300 rounded-full absolute top-0 right-0 p-1 m-4 z-10">
                <CiCirclePlus className="size-6 text-white"/>
          </TouchableOpacity>
          <Modal
          animationType="slide"
          transparent={false}
          visible={isOpen}
          onRequestClose={handleClose}>
            <ScrollView className="relative flex-1">
               <View className="p-5">
                {/* <Pressable className="bg-primary-300 rounded-full absolute top-0 right-0 p-1 m-4">
                  <IoCloseCircleOutline className="size-6 text-white"/>
                </Pressable> */}
                <View className="flex flex-row items-center justify-between"> 
                  <View className="flex-row items-center gap-3 mb-6">
                      <IoHomeOutline className="size-6 text-primary-300"/>
                        <Text className="text-2xl font-rubik-bold text-black-300">List Your Property</Text>
                  </View>
                  <Pressable onPress={handleClose} className="bg-primary-300 rounded-full p-1">
                    <IoCloseCircleOutline className="size-6 text-white"/>
                  </Pressable>
                </View> 
                {errors. length > 0 && (
                  <View className="bg-red-50 rounded-lg mb-4">
                    {errors.map((error, index) => (
                      <View key={index} className=" flex-row items-center gap-2 mb-1">
                        <MdOutlineErrorOutline className="size-6"/>
                        <Text className="text-danger">{error}</Text>
                      </View>
                    ))}
                  </View>
                )}
                { success && (
                  <View className="bg-green-50 rounded-lg mb-4 flex-row items-center gap-2">
                    <TiTickOutline className="size-6 text-[#22c55e]"/>
                    <Text className="text-green-600 font-rubik-medium">Property Listed Successfully</Text>
                  </View>
                )}

                  <TouchableOpacity
                  onPress={pickImage}
                  className="bg-white  border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6 items-center justify-center h-48">
                    {formData.image ? (
                    <Image
                    source={{uri: formData.image}}
                    className="absolute top-0 left-0 right-0 bottom-0"
                    resizeMode="cover"
                    />
                  ): (
                    <View className="items-center">
                      <CiCirclePlus className="size-6 text-white"/>
                      <Text className="text-sm font-rubik-bold text-black-300"> Upload Property Photos</Text>
                      <Text className="text-sm font-rubik-semibold text-black-300">Tap to select Images</Text>
                    </View>
                  )}
                  </TouchableOpacity>

                  <View className="mb-4">
                  <Text className="text-sm font-rubik-semibold text-black-300">Property Name</Text>
                  <TextInput
                  className="flex-1 p-3 text-white bg-black-100 rounded-xl"
                  value={formData.name}
                  onChangeText={(text) => setFormData({
                    ...formData, name: text
                  })}
                  placeholder="Enter Property name"
                  placeholderTextColor='#000'
                  />
                </View>

                <View className="mb-4">
                <Text className="text-sm font-rubik-semibold text-black-300">Description</Text>
                <TextInput
                className="flex-1 p-3 text-white bg-black-100 rounded-xl"
                value={formData.description}
                onChangeText={(text) => setFormData({
                  ...formData, description: text
                })}
                placeholder="Enter Property description"
                placeholderTextColor='#000'
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                />
              </View>

              <View className="flex-col gap-3 mb-4">
                <View className="flex-1">
                 <Text className="text-sm font-rubik-semibold text-black-300 mb-2">
                  Price
                 </Text>
                 <View className="rounded-lg border border-gray-200 flex-row items-center px-3">
                 <LiaMoneyBillWaveAltSolid className="size-5 text-primary-300"/>
                  <TextInput
                  className="flex-1 p-3 text-white bg-black-100 rounded-xl"
                  value={formData.price}
                  onChangeText={(text) => setFormData({
                    ...formData, price: text
                  })}
                  placeholder="Price"
                  placeholderTextColor='#000'
                  keyboardType="numeric"
                  />
                 </View>
                </View>

                <View className="flex-1">
                 <Text className="text-sm font-rubik-semibold text-black-300 mb-2"> Bathrooms</Text>
                 <View className="rounded-lg border border-gray-200 flex-row items-center px-3">
                  <Image source={icons.bath} className="size-5 text-primary-300"/>
                  <TextInput
                  className="flex-1 p-3 text-white bg-black-100 rounded-xl"
                  value={formData.bathrooms}
                  onChangeText={(text) => setFormData({
                    ...formData, bathrooms: text
                  })}
                  placeholder="Bathrooms"
                  placeholderTextColor='#000'
                  keyboardType="numeric"
                  />
                 </View>
                </View>
              </View>

              <View className="flex-col gap-3 mb-4">
                <View className="flex-1">
                 <Text className="text-sm font-rubik-semibold text-black-300 mb-2">
                  BedRooms
                 </Text>
                 <View className="rounded-lg border border-gray-200 flex-row items-center px-3">
                  <Image source={icons.bed} className="size-5 text-primary-300"/>
                  <TextInput
                  className="flex-1 p-3 text-white bg-black-100 rounded-xl"
                  value={formData.bedrooms}
                  onChangeText={(text) => setFormData({
                    ...formData, bedrooms: text
                  })}
                  placeholder="Price"
                  placeholderTextColor='#000'
                  keyboardType="numeric"
                  />
                 </View>
                </View>

                <View className="flex-1">
                 <Text className="text-sm font-rubik-semibold text-black-300 mb-2"> Area (sq ft)</Text>
                 <View className="rounded-lg border border-gray-200 flex-row items-center px-3">
                 <ChartArea  className="size-5 text-primary-300"/>
                  <TextInput
                  className="flex-1 p-3 text-white bg-black-100 rounded-xl"
                  value={formData.area}
                  onChangeText={(text) => setFormData({
                    ...formData, area: text
                  })}
                  placeholder="Bathrooms"
                  placeholderTextColor='#000'
                  keyboardType="numeric"
                  />
                 </View>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-rubik-semibold text-black-300">Location</Text>
                <View className="rounded-lg border border-gray-200 flex-row items-center px-3">
                  <Image source={icons.location} className="size-5
                  text-primary-300"/>
                  <TextInput
                  className="flex-1 p-3 text-white bg-black-100 rounded-xl"
                  value={formData.location}
                  onChangeText={(text) => setFormData({
                    ...formData, location: text
                  })}
                  placeholder="Enter Property description"
                  placeholderTextColor='#000'
                  />
                </View>
              </View>

              <TouchableOpacity
                    className={`bg-blue-600 p-4 rounded-lg items-center mt-6 ${isLoading ? 'opacity-70' : ''}`}
                    onPress={handleSubmit}
                    disabled={isLoading}>
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white font-semibold text-base">List Property</Text>
                    )}
              </TouchableOpacity>
              </View>
            </ScrollView>
          </Modal>
        </SafeAreaProvider>
  );
}
