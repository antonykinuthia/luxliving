import { View, Text,ScrollView, TouchableOpacity } from 'react-native'
import React, {useState} from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { categories } from '@/constants/data';


const Filters =() => {
 const params = useLocalSearchParams<{filter?: string}>();
 const [selected, setselected] = useState(params.filter || 'All');

 const handleCategory = (category: string) => {
    if(selected === category) {
        setselected('');
        router.setParams({filter: 'All'});
        return;
    }

    setselected(category);
    router.setParams({filter: category});
 }

 return(
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mt-3 mb-2'>
    {categories.map((item, index) => (
      <TouchableOpacity key={index} onPress={() => handleCategory(item.category)} className={`flex flex-col items-start mr-4 px-4 py-2 rounded-full ${selected === item.category ? 'bg-primary-300' : 'bg-primary-100 border border-primary-200'}`}>
        <Text className={`text-sm ${selected === item.category ? 'text-white font-rubik-bold mt-0.5' : 'text-black-300 font-rubik'}`}>{item.title}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
 )
}

export default Filters