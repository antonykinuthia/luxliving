import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  SafeAreaView,
  Modal,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Calendar from 'expo-calendar';
import { IoIosArrowRoundBack, IoIosHeartEmpty, IoIosSend } from "react-icons/io";
import { IoChatbubbleOutline, IoCloseCircleOutline, IoCalendarOutline } from "react-icons/io5";
import { LiaPhoneSolid } from "react-icons/lia";
import { CiLocationOn } from "react-icons/ci";

import { router, useLocalSearchParams } from "expo-router";

import icons from "@/constants/icons";
import images from "@/constants/images";
import Comment from "@/components/Comments";
import { facilities } from "@/constants/data";

import { useAppwrite } from "@/lib/useAppwrite";
import { getPropertyById, createBooking } from "@/lib/appwrite";
import DirectMessage from "@/components/DirectMessage";

const Properties = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [booking, setBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarPermission, setCalendarPermission] = useState(false);
  const [success, setSuccess] = useState(false);

  const windowHeight = Dimensions.get("window").height;

  const { data: property } = useAppwrite({
    fn: getPropertyById,
    params: {
      id: id!,
    },
  });

  // Request calendar permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        setCalendarPermission(true);
      }
    })();
  }, []);

  // Available time slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '01:00 PM', '02:00 PM', 
    '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  // Get today's date and 3 months from now for restrictions
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format date for backend (YYYY-MM-DD)
  const formatDateForBackend = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Handle date change
  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      setSelectedTime('');
    }
  };

  // Convert time string to Date object
  const getDateTimeFromTimeSlot = (dateStr: string, timeSlot: string) => {
    const [time, period] = timeSlot.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Add event to device calendar
  const addToDeviceCalendar = async (bookingDetails: any) => {
    if (!calendarPermission) {
      Alert.alert(
        'Calendar Permission',
        'Would you like to add this booking to your calendar?',
        [
          { text: 'Not Now', style: 'cancel' },
          { 
            text: 'Yes', 
            onPress: async () => {
              const { status } = await Calendar.requestCalendarPermissionsAsync();
              if (status === 'granted') {
                await createCalendarEvent(bookingDetails);
              }
            }
          }
        ]
      );
      return;
    }

    await createCalendarEvent(bookingDetails);
  };

  // Create calendar event
  const createCalendarEvent = async (bookingDetails: any) => {
    try {
      const defaultCalendar = await getDefaultCalendar();
      
      const startDate = getDateTimeFromTimeSlot(
        bookingDetails.date, 
        bookingDetails.time
      );
      
      // Set end time to 1 hour after start
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);

      const eventId = await Calendar.createEventAsync(defaultCalendar, {
        title: `Property Viewing - ${property?.name}`,
        startDate: startDate,
        endDate: endDate,
        location: property?.address,
        alarms: [
          { relativeOffset: -60 }, // 1 hour before
          { relativeOffset: -1440 }, // 1 day before
        ],
      });

      console.log('Calendar event created:', eventId);
    } catch (error) {
      console.error('Error creating calendar event:', error);
    }
  };

  // Get default calendar
  const getDefaultCalendar = async () => {
    if (Platform.OS === 'ios') {
      const defaultCalendar = await Calendar.getDefaultCalendarAsync();
      return defaultCalendar.id;
    } else {
      // For Android, get or create a calendar
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];
      
      if (defaultCalendar) {
        return defaultCalendar.id;
      }

      // Create a new calendar if none exists
      const newCalendarID = await Calendar.createCalendarAsync({
        title: 'Nyumbani Bookings',
        color: '#0061FF',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: undefined,
        source: {
          isLocalAccount: true,
          name: 'RentalApp',
          type: 'local' as any,
        },
        name: 'RentalApp Bookings',
        ownerAccount: 'personal',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });
      
      return newCalendarID;
    }
  };

  // Handle booking submission
  const handleBookingSubmit = async () => {
    if (!selectedTime) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const bookingData = {
        propertyId: id!,
        agentId: property?.agent.$id,
        date: formatDateForBackend(selectedDate),
        time: selectedTime,
      };

      // Create booking in database
      await createBooking(bookingData);
      
      // Add to device calendar
      await addToDeviceCalendar(bookingData);
      
      Alert.alert(
        'Success! 🎉', 
        'Your booking request has been submitted! The agent will confirm shortly.',
        [
          {
            text: 'OK',
            onPress: () => {
              setBooking(false);
              setSelectedDate(new Date());
              setSelectedTime('');
              setBookingNotes('');
              setSuccess(true);
            }
          }
        ]
      );
      
 
        router.push('/bookings/page');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="px-5 h-full">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 bg-white"
      >
        <View className="relative w-full" style={{ height: windowHeight / 2 }}>
          <Image
            source={{ uri: property?.image }}
            className="size-full"
            style={{
              width: '100%',
              height: '100%'
            }}
            resizeMode="cover"
          />
          <Image
            source={images.whiteGradient}
            className="absolute top-0 w-full z-40"
            style={{position: 'absolute',
                    top: 0, width: '100%',
                  zIndex:40}}
          />

          <View
            className="z-50 absolute inset-x-7"
            style={{
              top: Platform.OS === "ios" ? 70 : 20,
            }}
          >
            <View className="flex flex-row items-center w-full justify-between">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
              >
                <IoIosArrowRoundBack className="size-5 text-white"/>
              </TouchableOpacity>

              <View className="flex flex-row items-center gap-3">
                <IoIosHeartEmpty className="size-7 text-white"/>
                <TouchableOpacity onPress={() => router.push(`/chat/${id}`)}>
                  <IoIosSend  className='size-7 text-white'/>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View className="px-5 mt-7 flex gap-2">
          <Text className="text-2xl font-rubik-extrabold">
            {property?.name}
          </Text>

          <View className="flex flex-row items-center gap-3">
            <View className="flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full">
              <Text className="text-xs font-rubik-bold text-primary-300">
                {property?.type}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-2">
              <Image source={icons.star} className="size-5" />
              <Text className="text-black-200 text-sm mt-1 font-rubik-medium">
                {property?.rating} ({property?.reviews.length} reviews)
              </Text>
            </View>
          </View>

          <View className="flex flex-row items-center mt-5">
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10">
              <Image source={icons.bed} className="size-4" />
            </View>
            <Text className="text-black-300 text-sm font-rubik-medium ml-2">
              {property?.bedrooms} Bedrooms
            </Text>
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7">
              <Image source={icons.bath} className="size-4" />
            </View>
            <Text className="text-black-300 text-sm font-rubik-medium ml-2">
              {property?.bathrooms} Baths
            </Text>
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7">
              <Image source={icons.area} className="size-4" />
            </View>
            <Text className="text-black-300 text-sm font-rubik-medium ml-2">
              {property?.area} sqft
            </Text>
          </View>

          <View className="w-full border-t border-primary-200 pt-7 mt-5">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Agent
            </Text>

            <View className="flex flex-row items-center justify-between mt-4">
              <View className="flex flex-row items-center">
                <TouchableOpacity className="flex flex-row items-center" onPress={() => router.push(`/agents/${property?.agent.$id}`)}>
                  <Image
                    source={{ uri: property?.agent.avatar }}
                    className="size-14 rounded-full"
                  />

                  <View className="flex flex-col items-start justify-center ml-3">
                    <Text className="text-lg text-black-300 text-start font-rubik-bold">
                      {property?.agent.name}
                    </Text>
                    <Text className="text-sm text-black-200 text-start font-rubik-medium">
                      {property?.agent.email}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View className="flex flex-row items-center gap-3">
                 <DirectMessage
                  targetId={property?.agent.$id}
                  targetName={property?.agent.name}
                 />
                <LiaPhoneSolid className="text-primary-300 size-7"/>
              </View>
            </View>
          </View>

          <View className="mt-7">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Overview
            </Text>
            <Text className="text-black-200 text-base font-rubik mt-2">
              {property?.description}
            </Text>
          </View>

          <View className="mt-7">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Facilities
            </Text>

            {property?.facilities.length > 0 && (
              <View className="flex flex-row flex-wrap items-start justify-start mt-2 gap-5">
                {property?.facilities.map((item: string, index: number) => {
                  const facility = facilities.find(
                    (facility) => facility.title === item
                  );

                  return (
                    <View
                      key={index}
                      className="flex flex-1 flex-col items-center min-w-16 max-w-20"
                    >
                      <View className="size-14 bg-primary-100 rounded-full flex items-center justify-center">
                        <Image
                          source={facility ? facility.icon : icons.info}
                          className="size-6"
                        />
                      </View>

                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className="text-black-300 text-sm text-center font-rubik mt-1.5"
                      >
                        {item}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {property?.gallery.length > 0 && (
            <View className="mt-7">
              <Text className="text-black-300 text-xl font-rubik-bold">
                Gallery
              </Text>
              <FlatList
                contentContainerStyle={{ paddingRight: 20 }}
                data={property?.gallery}
                keyExtractor={(item) => item.$id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item.image }}
                    className="size-40 rounded-xl"
                  />
                )}
                contentContainerClassName="flex gap-4 mt-3"
              />
            </View>
          )}

          <View className="mt-7">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Location
            </Text>
            <View className="flex flex-row items-center justify-start mt-4 gap-2">
              <CiLocationOn className="size-7 text-primary-300"/>
              <Text className="text-black-200 text-sm font-rubik-medium">
                {property?.location}
              </Text>
            </View>

            <Image
              source={images.map}
              className="h-52 w-full mt-5 rounded-xl"
            />
          </View>

          {property?.reviews.length > 0 && (
            <View className="mt-7">
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row items-center">
                  <Image source={icons.star} className="size-6" />
                  <Text className="text-black-300 text-xl font-rubik-bold ml-2">
                    {property?.rating} ({property?.reviews.length} reviews)
                  </Text>
                </View>

                <TouchableOpacity>
                  <Text className="text-primary-300 text-base font-rubik-bold">
                    View All
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mt-5">
                <Comment item={property?.reviews[0]} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className=" px-5 absolute bg-white bottom-0 w-full rounded-t-2xl border-t border-r border-l border-primary-200 p-7" style={{width: '88%'}}>
        <View className="flex flex-row items-center justify-between gap-10">
          <View className="flex flex-col items-start">
            <Text className="text-black-200 text-xs font-rubik-medium">
              Price
            </Text>
            <Text
              numberOfLines={1}
              className="text-primary-300 text-start text-2xl font-rubik-bold"
            >
              ${property?.price}
            </Text>
          </View>

          <TouchableOpacity onPress={() => setBooking(true)} className="flex-1 flex flex-row items-center justify-center bg-primary-300 py-3 rounded-full shadow-md shadow-zinc-400">
            <Text className="text-white text-lg text-center font-rubik-bold">
              Book Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={booking}
        transparent
        animationType="slide"
        onRequestClose={() => setBooking(false)}
      >
        <Pressable 
          onPress={() => setBooking(false)} 
          className="flex-1 bg-black-300/50 justify-end"
        >
          <Pressable 
            onPress={(e) => e.stopPropagation()} 
            className="bg-white rounded-t-3xl"
            style={{ maxHeight: '85%', width: '100%' }}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {/* Header */}
              <View className="flex-row items-center justify-between p-5 border-b border-primary-100">
                <Text className="text-xl font-rubik-bold text-black-300">
                  Book a Viewing
                </Text>
                <TouchableOpacity onPress={() => setBooking(false)}>
                  <IoCloseCircleOutline className="size-7 text-black-300" />
                </TouchableOpacity>
              </View>

              {/* Property Info */}
              <View className="px-5 pt-4 pb-2">
                <Text className="text-base font-rubik-semibold text-black-300">
                  {property?.name}
                </Text>
                <View className="flex flex-row items-center gap-2 mt-1">
                  <CiLocationOn className="size-4 text-primary-300"/>
                  <Text className="text-sm font-rubik text-black-200" numberOfLines={1}>
                    {property?.location}
                  </Text>
                </View>
              </View>

              {/* Date Selection */}
              <View className="px-5 pt-6">
                <Text className="text-base font-rubik-bold text-black-300 mb-3">
                  Select Date
                </Text>
                
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="border border-primary-200 rounded-lg p-4 bg-primary-100/30"
                >
                  <View className="flex flex-row items-center justify-between">
                    <View>
                      <Text className="text-xs font-rubik text-black-200 mb-1">
                        Selected Date
                      </Text>
                      <Text className="text-base font-rubik-semibold text-black-300">
                        {formatDate(selectedDate)}
                      </Text>
                    </View>
                    <View className="bg-primary-300 rounded-full p-2">
                      <IoCalendarOutline className="size-5 text-white" />
                    </View>
                  </View>
                </TouchableOpacity>

                {showDatePicker && (
                  <View className="mt-4">
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onDateChange}
                      minimumDate={today}
                      maximumDate={maxDate}
                      textColor="#191D31"
                      style={{ 
                        backgroundColor: 'white',
                        width: '100%',
                      }}
                    />
                    
                    {Platform.OS === 'ios' && (
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(false)}
                        className="bg-primary-300 p-3 rounded-lg mt-3"
                      >
                        <Text className="text-center text-white font-rubik-semibold">
                          Confirm Date
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              <View className="px-5 pt-6">
                <Text className="text-base font-rubik-bold text-black-300 mb-3">
                  Select Time
                </Text>
                <View className="flex flex-row flex-wrap gap-3">
                  {timeSlots.map((time) => (
                    <TouchableOpacity
                      key={time}
                      onPress={() => setSelectedTime(time)}
                      className={`px-5 py-3 rounded-full border-2 ${
                        selectedTime === time
                          ? 'bg-primary-300 border-primary-300'
                          : 'bg-white border-primary-200'
                      }`}
                      style={{ minWidth: 110 }}
                    >
                      <Text
                        className={`text-sm font-rubik-semibold text-center ${
                          selectedTime === time
                            ? 'text-white'
                            : 'text-black-300'
                        }`}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            
              {selectedTime && (
                <View className="mx-5 mt-6 p-4 bg-white shadow-lg shadow-black-100/70 mb-5 rounded-xl">
                  <Text className="text-sm font-rubik-bold text-black-300 mb-2">
                    📅 Booking Summary
                  </Text>
                  <View className="flex flex-row items-start gap-2 mt-1">
                    <Text className="text-sm font-rubik-semibold text-black-300">
                      Date:
                    </Text>
                    <Text className="text-sm font-rubik text-black-200 flex-1">
                      {formatDate(selectedDate)}
                    </Text>
                  </View>
                  <View className="flex flex-row items-start gap-2 mt-1">
                    <Text className="text-sm font-rubik-semibold text-black-300">
                      Time:
                    </Text>
                    <Text className="text-sm font-rubik text-black-200">
                      {selectedTime}
                    </Text>
                  </View>
                  {bookingNotes && (
                    <View className="flex flex-row items-start gap-2 mt-1">
                      <Text className="text-sm font-rubik-semibold text-black-300">
                        Notes:
                      </Text>
                      <Text className="text-sm font-rubik text-black-200 flex-1">
                        {bookingNotes}
                      </Text>
                    </View>
                  )}
                  <View className="mt-3 pt-3 border-t border-primary-200">
                    <Text className="text-xs font-rubik text-black-200">
                      ✓ Event will be added to your calendar
                    </Text>
                    <Text className="text-xs font-rubik text-black-200">
                      ✓ Reminders set for 1 hour and 1 day before
                    </Text>
                  </View>
                </View>
              )}

              {/* Confirm Button */}
              <View className="px-5 pt-6">
                <TouchableOpacity 
                  onPress={handleBookingSubmit}
                  disabled={!selectedTime || isSubmitting}
                  className={`p-4 rounded-full shadow-md shadow-zinc-300 ${
                    selectedTime && !isSubmitting
                      ? 'bg-primary-300'
                      : 'bg-primary-200'
                  }`}
                >
                  <Text className="text-center font-rubik-bold text-white text-base">
                    {isSubmitting ? 'Submitting...' : 'Confirm Booking Request'}
                  </Text>
                </TouchableOpacity>
                
                {!selectedTime && (
                  <Text className="text-center text-xs font-rubik text-black-200 mt-2">
                    Please select a time slot to continue
                  </Text>
                )}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default Properties;