import icons from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";
import { Link, Stack } from "expo-router";
import { Image } from "react-native";

export default function RootLayout () {
    const user = useGlobalContext();
    return (
       <Stack>
        <Stack.Screen name="index" options={{ headerTitle: 'settings', 
        presentation: 'modal'
        }}/>
       </Stack>
    )
}