import { View, Text, Image } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import icons from '@/constants/icons'
import { Link } from 'expo-router'
import { CiCirclePlus } from 'react-icons/ci'

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
  return (
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
  )
}

export default TabsLayout