import { Button, Text, TouchableOpacity, View, FlatList, Image, ActivityIndicator, Modal, Pressable, ScrollView, TextInput, Alert } from "react-native";
import { useEffect, useState } from "react";
import { GoBell } from "react-icons/go";
import Search from "@/components/Search";
import Filters from "@/components/Filters";
import { useLocalSearchParams, router } from "expo-router";
import { useAppwrite } from "@/lib/useAppwrite";
import { getLatestProperties, getProperties, uploadProperty, getReels, toggleLike, incrementView } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { Cards, FeaturedCards } from "@/components/Cards";
import NoResults from "@/components/NoResult";
import { IoCloseCircleOutline } from "react-icons/io5";
import images from "@/constants/images";
import { PROPERTY_TYPES } from "@/constants/data";

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ReelsPlayer from "@/components/Reels";

interface PropertyReel {
  $id: string;
  videoUrl: string;
  thumbnailUrl: string;
  userId: string;
  username: string;
  description: string;
  likes: number;
  views: number;
  isLiked?: boolean;
  $createdAt: string;
  location: string;
  price: number;
}

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [reelsModalOpen, setReelsModalOpen] = useState(false);
  const [isLoadingReels, setIsLoadingReels] = useState(false);
  const [propertyReels, setPropertyReels] = useState<PropertyReel[]>([]);
  const [reelsPage, setReelsPage] = useState(0);

  const params = useLocalSearchParams<{ query?: string; filter: string }>();
  const { user } = useGlobalContext();

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

  useEffect(() => {
    if (user?.$id) {
      setFormData(prev => ({ ...prev, agentId: user.$id }));
    }
  }, [user]);

  // Load reels when modal opens
  useEffect(() => {
    if (reelsModalOpen && propertyReels.length === 0) {
      loadPropertyReels();
    }
  }, [reelsModalOpen]);

  const loadPropertyReels = async () => {
    try {
      setIsLoadingReels(true);
      const reels = await getReels(10, reelsPage * 10);
      if (reels) {
        setPropertyReels(prev => [...prev, ...reels]);
        setReelsPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading reels:', error);
      Alert.alert('Error', 'Failed to load reels');
    } finally {
      setIsLoadingReels(false);
    }
  };

  const handleCardPress = (id: string) => router.push(`/properties/${id}`);

  const handleReelLike = async (reelId: string, isLiked: boolean) => {
    try {
      const reel = propertyReels.find(r => r.$id === reelId);
      if (!reel) return;

      await toggleLike(reelId, reel.likes, isLiked);
      
      setPropertyReels(prev =>
        prev.map(reel =>
          reel.$id === reelId
            ? { ...reel, likes: isLiked ? reel.likes + 1 : reel.likes - 1, isLiked }
            : reel
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleReelViewChange = async (reelId: string) => {
    try {
      const reel = propertyReels.find(r => r.$id === reelId);
      if (!reel) return;

      await incrementView(reelId, reel.views);
      
      setPropertyReels(prev =>
        prev.map(r =>
          r.$id === reelId
            ? { ...r, views: r.views + 1 }
            : r
        )
      );
    } catch (error) {
      console.error('Error updating view:', error);
    }
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

             
              <TouchableOpacity 
                onPress={() => setReelsModalOpen(true)}
                activeOpacity={0.85}
                className="my-6 bg-gradient-to-br from-primary-100 via-primary-50 to-white rounded-3xl overflow-hidden border border-primary-200 shadow-sm"
              >
                <View className="p-5">
                  {/* Header Section */}
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="bg-primary-300 rounded-full p-2">
                        <Text className="text-2xl">🎬</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-rubik-bold text-black-300">Property Reels</Text>
                        <Text className="text-xs text-primary-300 font-rubik-semibold mt-0.5">Discover & Explore</Text>
                      </View>
                    </View>
                    <View className="bg-primary-300 rounded-full px-3 py-1.5">
                      <Text className="text-white text-xs font-rubik-bold">Tap</Text>
                    </View>
                  </View>

                  {/* Description */}
                  <Text className="text-sm text-black-300 mb-4 font-rubik leading-5">
                    Watch immersive property tours and agent spotlights
                  </Text>

                  {/* CTA Section */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2 bg-white rounded-lg px-3 py-2 flex-1 mr-3 border border-primary-200">
                      <Text className="text-xl">📺</Text>
                      <Text className="text-xs font-rubik-semibold text-black-300">Full Screen</Text>
                    </View>
                    <View className="bg-primary-300/10 rounded-lg px-3 py-2">
                      <Text className="text-primary-300 font-rubik-bold text-sm">→</Text>
                    </View>
                  </View>
                </View>

                {/* Gradient divider */}
                <View className="h-1 bg-gradient-to-r from-primary-300 via-primary-200 to-transparent" />
              </TouchableOpacity>

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
      <Modal
        animationType="slide"
        transparent={false}
        visible={reelsModalOpen}
        onRequestClose={() => setReelsModalOpen(false)}
        presentationStyle="fullScreen"
      >
        <SafeAreaView className="flex-1 bg-black">
          {/* Close Button */}
          <View className="absolute top-4 right-4 z-50">
            <Pressable 
              onPress={() => setReelsModalOpen(false)}
              className="bg-black/50 rounded-full p-2 active:bg-black/70"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IoCloseCircleOutline className="size-7 text-white" />
            </Pressable>
          </View>

          {isLoadingReels && propertyReels.length === 0 ? (
            <View className="flex-1 justify-center items-center bg-black">
              <ActivityIndicator size="large" color="primary-300" />
              <Text className="text-white mt-4 font-rubik">Loading reels...</Text>
            </View>
          ) : propertyReels.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-white text-center text-lg font-rubik">
                No reels available yet
              </Text>
            </View>
          ) : (
            <View className="flex-1">
              <ReelsPlayer
                Videos={propertyReels}
                onEndReached={loadPropertyReels}
                onLike={handleReelLike}
                onViewChange={handleReelViewChange}
              />
            </View>
          )}

          {/* Bottom gradient fade for better UX */}
          <View className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/50 to-transparent" />
        </SafeAreaView>
      </Modal>
    </SafeAreaProvider>
  );
}