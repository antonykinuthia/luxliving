import { Button, Text, TouchableOpacity, View, FlatList, Image, ActivityIndicator, Modal, Pressable, ScrollView, TextInput, Alert, } from "react-native";
import { useEffect, useState } from "react";
import { GoBell } from "react-icons/go";
import Search from "@/components/Search";
import Filters from "@/components/Filters";
import { useLocalSearchParams, router } from "expo-router";
import { useAppwrite } from "@/lib/useAppwrite";
import { getLatestProperties, getProperties, uploadProperty } from "@/lib/appwrite";
import * as ImagePicker from 'expo-image-picker';

import { useGlobalContext } from "@/lib/global-provider";
import { Cards, FeaturedCards } from "@/components/Cards";
import NoResults from "@/components/NoResult";
import { CiCirclePlus } from "react-icons/ci";
import { IoCloseCircleOutline } from "react-icons/io5";
import images from "@/constants/images";
import { FACILITIES, PROPERTY_TYPES } from "@/constants/data";
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
  
  const params = useLocalSearchParams<{ query?: string; filter: string }>();
  const { user } = useGlobalContext();
  
  // Initialize formData with user ID from context
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

  const { data: latestProperties, loading: latestPropertiesLoading } = useAppwrite({
    fn: getLatestProperties
  });

  const { data: properties, loading, refetch } = useAppwrite({
    fn: getProperties,
    params: {
      filter: params.filter!,
      query: params.query!,
      limit: 6
    },
    skip: true,
  });

  useEffect(() => {
    refetch({
      filter: params.filter!,
      query: params.query!,
      limit: 6
    });
  }, [params.filter, params.query]);

  // Update agentId when user changes
  useEffect(() => {
    if (user?.$id) {
      setFormData(prev => ({ ...prev, agentId: user.$id }));
    }
  }, [user]);

  const handleCardPress = (id: string) => router.push(`/properties/${id}`);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const handleClose = () => {
    setIsOpen(!isOpen);
    // Reset form and states when closing
    setSuccess(false);
    setErrors([]);
  };

  // Validation function
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

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors([]);
    setSuccess(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await uploadProperty(formData);

      if (result.success) {
        setSuccess(true);
        Alert.alert('Success', 'Property uploaded successfully!');
        
        // Reset form after successful upload
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

        // Refetch properties to show the new one
        refetch({
          filter: params.filter!,
          query: params.query!,
          limit: 6
        });

        // Close modal after 2 seconds
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
        }, 2000);
      } else {
        setErrors([result.error || 'Failed to upload property']);
        Alert.alert('Error', result.error || 'Failed to upload property');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Something went wrong. Please try again.';
      setErrors([errorMessage]);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle facility selection
  const toggleFacility = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="bg-white h-full relative">
        <FlatList
          data={properties}
          renderItem={({ item }) => <Cards item={item} onPress={() => handleCardPress(item.$id)} />}
          keyExtractor={(item) => item.$id}
          numColumns={2}
          contentContainerClassName="pb-32"
          columnWrapperClassName="flex gap-5 px-5"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator size='large' className="text-primary-300 mt-5" />
            ) : <NoResults />
          }
          ListHeaderComponent={
            <View className="px-5">
              <View className="flex flex-row justify-between items-center mt-5">
                <View className="flex flex-row items-center">
                  <Image source={images.avatar} className="size-12 rounded-full" />
                  <View className="flex flex-col items-start ml-2 justify-center">
                    <Text className="text-xs font-rubik text-black-100">welcome</Text>
                    <Text className="text-base font-rubik-medium text-black-300">{user?.name || '1764'}</Text>
                  </View>
                </View>
                <GoBell className="size-6" />
              </View>
              <Search />

              <View className="my-5">
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-xl font-rubik-bold text-black-300">Featured</Text>
                  <TouchableOpacity onPress={() => router.push('/explore')}>
                    <Text className="text-base font-rubik-bold text-primary-300">See All</Text>
                  </TouchableOpacity>
                </View>
                {latestPropertiesLoading ? <ActivityIndicator size='large' className="text-primary-300" /> : !latestProperties || latestProperties.length === 0 ? <NoResults /> : (
                  <FlatList
                    data={latestProperties}
                    renderItem={({ item }) => <FeaturedCards item={item} onPress={() => handleCardPress(item.$id)} />}
                    keyExtractor={(item) => item.$id}
                    horizontal
                    bounces={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="flex gap-5 mt-5"
                  />
                )}
              </View>

              <View className="flex flex-row items-center justify-between">
                <Text className="text-xl font-rubik-bold text-black-300">Recommendations</Text>
                <TouchableOpacity onPress={() => router.push('/explore')}>
                  <Text className="text-base font-rubik-bold text-primary-300">See All</Text>
                </TouchableOpacity>
              </View>

              <Filters />

            </View>
          }
        />

      </SafeAreaView>
      <TouchableOpacity onPress={() => setIsOpen(true)} className="bg-primary-300 rounded-full absolute top-0 right-0 p-1 m-4 z-10">
        <CiCirclePlus className="size-6 text-white" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={false}
        visible={isOpen}
        onRequestClose={handleClose}>
        <ScrollView className="relative flex-1">
          <View className="p-5">
            <View className="flex flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 mb-6">
                <IoHomeOutline className="size-6 text-primary-300" />
                <Text className="text-2xl font-rubik-bold text-black-300">List Your Property</Text>
              </View>
              <Pressable onPress={handleClose} className="bg-primary-300 rounded-full p-1">
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
                  source={{ uri: formData.image }}
                  className="absolute top-0 left-0 right-0 bottom-0 rounded-lg"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center">
                  <CiCirclePlus className="size-12 text-gray-400" />
                  <Text className="text-sm font-rubik-bold text-black-300 mt-2">Upload Property Photos</Text>
                  <Text className="text-xs font-rubik text-gray-500">Tap to select images</Text>
                </View>
              )}
            </TouchableOpacity>

            <View className="mb-4">
              <Text className="text-sm font-rubik-semibold text-black-300 mb-2">Property Name </Text>
              <TextInput
                className="p-3 bg-gray-50 rounded-xl border border-gray-200"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter property name"
                placeholderTextColor='#9ca3af'
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-rubik-semibold text-black-300 mb-2">Description </Text>
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
                <Text className="text-sm font-rubik-semibold text-black-300 mb-2">Price </Text>
                <View className="rounded-xl border border-gray-200 bg-gray-50 flex-row items-center px-3">
                  <LiaMoneyBillWaveAltSolid className="size-5 text-primary-300" />
                  <TextInput
                    className="flex-1 p-3"
                    value={formData.price}
                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                    placeholder="Price (KES)"
                    placeholderTextColor='#9ca3af'
                    keyboardType="numeric"
                  />
                </View>
              </View>
             
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-rubik-semibold text-black-300 mb-2">Bedrooms </Text>
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
                <Text className="text-sm font-rubik-semibold text-black-300 mb-2">Bathrooms </Text>
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
              <Text className="text-sm font-rubik-semibold text-black-300 mb-2">City </Text>
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
              <Text className="text-sm font-rubik-semibold text-black-300 mb-2">County </Text>
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

            {/* Optional: Facilities selection */}
            {FACILITIES && FACILITIES.length > 0 && (
              <View className="mb-4">
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

            <TouchableOpacity
              className={`bg-primary-300 p-4 rounded-xl items-center mt-6 ${isLoading ? 'opacity-70' : ''}`}
              onPress={handleSubmit}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-rubik-bold text-base">List Property</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </SafeAreaProvider>
  );
}