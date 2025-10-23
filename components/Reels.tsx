import { View, Text, FlatList, TouchableOpacity, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Video as VideoType } from '../utils/types';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import icons from '@/constants/icons';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface ReelsProps {
  Videos: VideoType[];
  onEndReached: () => void;
  onLike: (videoId: string, isLiked: boolean) => void;
  onViewChange: (videoId: string) => void;
}

interface VideoItemProps {
  video: VideoType;
  isActive: boolean;
  onLike: (videoId: string, isLiked: boolean) => void;
}

const ReelsPlayer = ({ Videos, onEndReached, onLike, onViewChange }: ReelsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setCurrentIndex(index);
      onViewChange(Videos[index].$id);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item, index }: { item: VideoType; index: number }) => (
    <VideoItem 
      video={item} 
      isActive={index === currentIndex} 
      onLike={onLike} 
    />
  );

  return (
    <View className="flex-1 bg-black">
      <FlatList
        ref={flatListRef}
        data={Videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.$id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        decelerationRate="fast"
        snapToInterval={screenHeight}
        snapToAlignment="start"
      />
    </View>
  );
};

const VideoItem = ({ video, isActive, onLike }: VideoItemProps) => {
  const [isLiked, setIsLiked] = useState(video.isLiked || false);
  const [loading, setLoading] = useState(false);

  const player = useVideoPlayer(video.videoUrl, (player) => {
    player.loop = true;
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    onLike(video.$id, newLikedState);
  };

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  return (
    <View style={{ height: screenHeight, width: screenWidth }} className="bg-black relative">
      <TouchableOpacity activeOpacity={1} className="flex-1">
        <VideoView 
          player={player} 
          allowsFullscreen 
          className="flex-1"
          nativeControls={false}
          style={{ height: screenHeight, width: screenWidth }} 
        />
        
        {loading && (
          <View className="absolute inset-0 justify-center items-center bg-black/50">
            <ActivityIndicator size="large" color="primary-300" />
          </View>
        )}

        <Pressable
          onPress={() => {
            if (isPlaying) {
              player.pause();
            } else {
              player.play();
            }
          }}
          className="absolute inset-0"
        />
      </TouchableOpacity>

      {/* Right side controls */}
      <View className="absolute right-3 bottom-24 gap-6">
        <TouchableOpacity 
          onPress={handleLike}
          className="items-center"
        >
          <Text className="text-xl bg-transparent">
            {isLiked ? '💖' : '🤍'}
          </Text>
          <Text className="text-white text-xs mt-1">
            {video.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <Text className="text-xl">💬</Text>
          <Text className="text-white text-xs mt-1">
            Comment
          </Text>
        </TouchableOpacity>

        

        <TouchableOpacity className="items-center">
          <Text className="text-2xl">📤</Text>
          <Text className="text-white text-xs mt-1">
            Share
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom info */}
      <View className="absolute bottom-5 left-3 right-20 w-2/3">
        <TouchableOpacity >
          <Text className="text-white text-lg font-rubik-light">
            @{video.username}
          </Text>
        </TouchableOpacity>
        <Text className="text-white text-sm mt-1">
          {video.description}
        </Text>
        <Text className="text-white text-sm mt-1">
          {video.price}
        </Text>
        <Text className="text-white text-sm mt-1">
          {video.location}
        </Text>
      </View>
    </View>
  );
};

export default ReelsPlayer;