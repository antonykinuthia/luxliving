import images from "@/constants/images";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Image, SafeAreaView, Text, View, TouchableOpacity, FlatList, Button, ActivityIndicator } from "react-native";
import { GoBell } from "react-icons/go";
import Search from "@/components/Search";
import { Cards, FeaturedCards } from "@/components/Cards";
import Filters from "@/components/Filters";
import seed from '@/lib/seed';
import { useAppwrite } from "@/lib/useAppwrite";
import { getProperties } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import NoResults from "@/components/NoResult";
import { IoIosArrowRoundBack } from "react-icons/io";
import { Video} from '../../../utils/types'

export default function Explore() {
  const params = useLocalSearchParams<{query?: string; filter?: string}>();

  useEffect(() => {

  })
  
  const {data: properties, loading, refetch} = useAppwrite({
    fn: getProperties,
    params: {
      filter: params.filter!,
      query: params.query!,
      limit: 20
    },
    skip: true,
  })

  const handleCardPress = (id:string) => router.push(`/properties/${id}`);

  useEffect(() => {
    refetch({
      filter: params.filter!,
      query: params.query!,
      limit: 20
    });
  }, [params.filter, params.query]);

  return (
    <SafeAreaView className="bg-white h-full">
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
          <View className="flex flex-row items-center justify-between mt-5">
           <TouchableOpacity onPress={() => router.back()} className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center">
           <IoIosArrowRoundBack className="size-5"/>
           </TouchableOpacity>
           <Text className="text-base mr-2 text-center font-rubik-medium text-black-300">
            Search for Your Ideal Residence
           </Text>
           <GoBell className="size-5"/>
          </View>
          <Search/>

          <View className="mt-5">
            <Filters/>
           <Text className="text-xl font-rubik-bold text-black-300 mt-20">
            Found {properties?.length} Properties
           </Text>
          </View>
        </View>
      }
      />
    </SafeAreaView>
  );
}
