import { Stack } from 'expo-router';

export default function TabsStackLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
            <Stack.Screen name="listaViaggi" options={{ title: 'Lista Viaggi', headerShown: false }} />
        </Stack>
    );
}