// app/(root)/bookings/index.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { getBookings } from '@/lib/appwrite';
import BookingCard from '@/components/Bookings';

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings based on active tab
  const fetchBookings = async (status?: string) => {
    setLoading(true);
    try {
      const data = await getBookings(status === 'all' ? undefined : status);
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when tab changes
  React.useEffect(() => {
    fetchBookings(activeTab);
  }, [activeTab]);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const getBookingCount = (status: string) => {
    if (!bookings) return 0;
    return bookings.length;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-5 pb-3 border-b border-primary-100">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary-200 rounded-full size-11 items-center justify-center mr-3 "
          >
            <IoIosArrowRoundBack className="size-6 text-black-200" />
          </TouchableOpacity>
          <Text className="text-2xl font-rubik-bold text-black-300">
            My Bookings
          </Text>
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2 flex-wrap">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full ${
                activeTab === tab.key
                  ? 'bg-primary-300'
                  : 'bg-primary-100'
              }`}
            >
              <Text
                className={`text-sm font-rubik-semibold ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-primary-300'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bookings List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0061FF" />
          <Text className="text-sm font-rubik text-black-200 mt-3">
            Loading bookings...
          </Text>
        </View>
      ) : bookings && bookings.length > 0 ? (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <BookingCard bookings={item} onUpdate={() => fetchBookings(activeTab)} />
          )}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => fetchBookings(activeTab)}
              tintColor="#0061FF"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-6xl mb-4">📅</Text>
          <Text className="text-xl font-rubik-bold text-black-300 text-center mb-2">
            No {activeTab !== 'all' ? activeTab : ''} bookings
          </Text>
          <Text className="text-sm font-rubik text-black-200 text-center mb-6">
            {activeTab === 'all'
              ? "You haven't booked any property viewings yet"
              : `You don't have any ${activeTab} bookings`}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(root)/(tabs)/explore')}
            className="bg-primary-300 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-rubik-semibold">
              Explore Properties
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MyBookings;