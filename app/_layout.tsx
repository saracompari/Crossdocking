import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "./global.css";

export default function RootLayout() {
  return <>
    <StatusBar hidden={true}></StatusBar>
    <Stack screenOptions={{ headerShown: false }}>
    </Stack>
  </>
}