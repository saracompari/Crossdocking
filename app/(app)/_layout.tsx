import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export default function TabsStackLayout() {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem("auth_token");
            const validita = await AsyncStorage.getItem("auth_validita");

            const isTokenValid = token && validita && new Date(validita) > new Date();

            if (!isTokenValid) {
                await AsyncStorage.removeItem("auth_token");
                await AsyncStorage.removeItem("auth_validita");
                router.replace("/(auth)/login");
            } else {
                setChecking(false);
            }
        };

        checkAuth();
    }, []);

    if (checking) return null;

    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
            <Stack.Screen name="listaViaggi" options={{ title: 'Lista Viaggi', headerShown: false }} />
            <Stack.Screen name="trazione" options={{ title: 'Nuova Trazione', headerShown: true }} />
            <Stack.Screen name="trazione/[serialTrazione]/index" options={{ title: 'Dettaglio Trazione' }} />
            <Stack.Screen name="trazione/[serialTrazione]/modifica" options={{ title: 'Modifica Trazione' }} />
        </Stack>
    );
}