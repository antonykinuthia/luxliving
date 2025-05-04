// import React, { useEffect, useRef } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { formatDistanceToNow } from 'date-fns';
// import { Check, CheckCheck } from 'lucide-react-native';
// import { Message, User } from '../lib/appwrite';
// import Animated, { FadeIn, Layout } from 'react-native-reanimated';

// interface ChatMessageProps {
//   message: Message;
//   isCurrentUser: boolean;
//   sender?: User;
// }

// const ChatMessage = ({ message, isCurrentUser, sender }: ChatMessageProps) => {
//   const messageRef = useRef<View>(null);
  
//   useEffect(() => {
//     // Scroll new messages into view
//     messageRef.current?.measureLayout(
//       messageRef.current,
//       () => {},
//       () => {}
//     );
//   }, [message.$id]);

//   const getFormattedTime = (dateString?: string) => {
//     if (!dateString) return '';
//     try {
//       return formatDistanceToNow(new Date(dateString), { addSuffix: true });
//     } catch (e) {
//       return '';
//     }
//   };

//   return (
//     <Animated.View
//       ref={messageRef}
//       className={`flex-row my-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
//       entering={FadeIn.duration(300)}
//       layout={Layout.springify()}
//     >
//       <View
//         className={`px-3 py-2 max-w-[80%] rounded-2xl 
//           ${isCurrentUser 
//             ? 'bg-primary-500 rounded-tr-none' 
//             : 'bg-gray-200 rounded-tl-none'}`
//         }
//       >
//         <Text 
//           className={`text-base ${isCurrentUser ? 'text-white' : 'text-gray-800'}`}
//         >
//           {message.content}
//         </Text>
        
//         <View className="flex-row items-center justify-end mt-1">
//           <Text 
//             className={`text-xs mr-1 ${
//               isCurrentUser ? 'text-primary-100' : 'text-gray-500'
//             }`}
//           >
//             {getFormattedTime(message.$createdAt || message.created_at)}
//           </Text>
          
//           {isCurrentUser && (
//             message.read ? (
//               <CheckCheck size={14} color={isCurrentUser ? "#fff" : "#666"} />
//             ) : (
//               <Check size={14} color={isCurrentUser ? "#fff" : "#666"} />
//             )
//           )}
//         </View>
//       </View>
//     </Animated.View>
//   );
// };

// export default ChatMessage;