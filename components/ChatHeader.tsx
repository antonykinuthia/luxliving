// import React from 'react';
// import { View, Text, Image, TouchableOpacity } from 'react-native';
// import { ArrowLeft, Phone, Video, MoveVertical as MoreVertical } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { User } from '../lib/appwrite';

// interface UserHeaderProps {
//   user: User | null;
//   loading?: boolean;
//   backPath?: string;
// }

// const UserHeader = ({ user, loading = false, backPath = '/' }: UserHeaderProps) => {
//   const router = useRouter();

//   if (loading || !user) {
//     return (
//       <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
//         <TouchableOpacity 
//           onPress={() => router.push(backPath)}
//           className="pr-3"
//         >
//           <ArrowLeft size={24} color="#000" />
//         </TouchableOpacity>
        
//         <View className="w-10 h-10 rounded-full bg-gray-200" />
//         <View className="ml-3 flex-1">
//           <View className="w-24 h-5 bg-gray-200 rounded" />
//           <View className="w-16 h-4 bg-gray-100 rounded mt-1" />
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
//       <TouchableOpacity 
//         onPress={() => router.push(backPath)}
//         className="pr-3"
//       >
//         <ArrowLeft size={24} color="#000" />
//       </TouchableOpacity>
      
//       <Image
//         source={{ 
//           uri: user.avatar || 
//             `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random` 
//         }}
//         className="w-10 h-10 rounded-full"
//       />
      
//       <View className="ml-3 flex-1">
//         <Text className="font-bold text-base">{user.name}</Text>
//         <Text className="text-sm text-gray-500">
//           {user.online ? 'Online' : 'Offline'}
//         </Text>
//       </View>
      
//       <View className="flex-row">
//         <TouchableOpacity className="p-2">
//           <Phone size={20} color="#000" />
//         </TouchableOpacity>
//         <TouchableOpacity className="p-2">
//           <Video size={20} color="#000" />
//         </TouchableOpacity>
//         <TouchableOpacity className="p-2">
//           <MoreVertical size={20} color="#000" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default UserHeader;