import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export default function TabsStackLayout() {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        AsyncStorage.getItem("auth_token").then((token) => {
            if (!token) {
                router.replace("/(auth)/login");
            } else {
                setChecking(false);
            }
        });
    }, []);

    if (checking) return null;
    return (<>
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
            <Stack.Screen name="listaViaggi" options={{ title: 'Lista Viaggi', headerShown: false }} />
            <Stack.Screen name="trazione" options={{ title: 'Nuova Trazione', headerShown: true }} />
            <Stack.Screen name="trazione/[serialTrazione]/index" options={{ title: 'Dettaglio Trazione' }} />
            <Stack.Screen name="trazione/[serialTrazione]/modifica" options={{ title: 'Modifica Trazione' }} />
        </Stack>
    </>
    );
}