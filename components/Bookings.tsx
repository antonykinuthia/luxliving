import { cancelBooking } from '@/lib/appwrite';
import { router } from 'expo-router';
import React from 'react'
import { CiLocationOn } from 'react-icons/ci';
import { IoCalendarOutline } from 'react-icons/io5';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';


interface Props {
    bookings: any
    onUpdate: () => void;
}

const BookingCard = ({bookings, onUpdate}: Props) => {
    const property = bookings.property;
    const agent = bookings.agent;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
             weekday: 'short',
             year: 'numeric',
             month: 'short', 
             day: 'numeric' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
          case 'confirmed':
            return 'bg-green-100 text-green-700';
          case 'pending':
            return 'bg-yellow-100 text-yellow-700';
          case 'cancelled':
            return 'bg-red-100 text-red-700';
          case 'completed':
            return 'bg-blue-100 text-blue-700';
          default:
            return 'bg-gray-100 text-gray-700';
        }
      };

      const handleCancel = () =>{
        Alert.alert(
            'cancel Booking',
            'Are you sure you want to cancel this booking?',
            [
                {text: 'No', style: 'cancel'},
                {
                    text: 'yes, cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await cancelBooking(bookings.$id!);
                            Alert.alert('Booking cancelled successfully');
                            onUpdate();
                        } catch (error) {
                            Alert.alert('Failed to cancel booking');
                        }
                    }
                }
            ]
        )
      }
      const handleReschedule = () => {
          router.push({
              pathname:'/properties/[id]',
              params: {id: property.$id, rescheduleId: bookings.$id},
          })
      };

      const isPast = new Date(bookings.date) < new Date();
      const canCancel = bookings.status === 'cancelled' && !isPast;
      const canReschedule = bookings.status === ' pending' && !isPast;
     
        return (
          <View className="bg-white rounded-2xl mb-4 overflow-hidden border border-primary-100 shadow-lg shadow-black-100/70">
            <TouchableOpacity
            onPress={() => router.push(`/properties/${property.$id}`)}
            activeOpacity={0.8}
            >
                <Image
                source={{uri: property?.image}}
                className='w-full h-48'
                resizeMode='cover'
                />
            </TouchableOpacity>

            <View className='p-4'>
                <View className='flex-row items-center justify-between mb-3'>
                    <View className={`px-3 py-1 rounded-full ${getStatusColor(bookings.status)}`}>
                        <Text className={`text-xs font-rubik-semibold capitalize ${getStatusColor(bookings.status).split(' ')[1]}`}>
                            {bookings.status}
                        </Text>
                    </View>
                    {isPast&& (
                        <Text className='text-xs font-rubik-semibold text-black-200'>
                            Past
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                onPress={() => router.push(`/properties/${property?.$id}`)}
                >
                    <Text className='text-lg font-rubik-bold text-black-300 mb-2'>
                        {property?.name}
                    </Text>
                </TouchableOpacity>

                <View className='flex-row items-center mb-2'>
                    <CiLocationOn className='size-4 text-primary-300'/>
                    <Text
                    className='text-sm font-rubik text-black-200 ml-2
                    flex-1'
                    numberOfLines={1}
                    >
                        {property?.location}
                    </Text>
                </View>

                <View className='flex-row items-center mb-2'>
                    <IoCalendarOutline className='size-4 text-primary-300'/>
                    <Text className='text-sm font-rubik-medium text-black-300 ml-2'>
                        {bookings.bookingTime}
                    </Text>
                </View>

                <View className='flex-row items-center pt-3 border-t border-primary-100 mb-3'>
                    <Image
                    source={{uri: agent?.avatar}}
                    className='size-10 rounded-full'
                    />
                    <View className='ml-3 flex-1'>
                        <Text className='text-sm font-rubik-semibold text-black-300'>
                            {agent?.name}
                        </Text>
                    </View>
                </View>

                <View className='flex-row gap-2'>
                    {canReschedule && (
                        <TouchableOpacity
                        onPress={handleReschedule}
                        className='flex-1 bg-primary-100 py-3 rounded-lg'
                        >
                            <Text className='text-center text-sm font-rubik-semibold text-primary-300'>
                                Reschedule
                            </Text>
                        </TouchableOpacity>
                    )}

                    {canCancel && (
                        <TouchableOpacity
                        onPress={handleCancel}
                        className='flex-1 text-danger rounded-lg'
                        >
                            Cancel
                        </TouchableOpacity>
                    )}

                    {bookings.status === 'confirmed' && !isPast && (
                        <TouchableOpacity
                        onPress={() =>  router.push(`/chat/${property.$id}`)}
                        className='flex-1 bg-primary-300 py-3 rounded-lg'
                        >
                            <Text className='text-center text-sm font-rubik-semibold text-wite'>
                                Message Agent
                            </Text>

                        </TouchableOpacity>
                    ) }
                </View>

            </View>
          </View>
        )
};
 

export default BookingCard