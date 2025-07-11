import { FontAwesome } from '@expo/vector-icons';

import { router, Tabs } from 'expo-router';
import React from "react";
import { TouchableOpacity, View } from 'react-native';

export default function ListaViaggiTabsLayout() {
    return (
        <>
            <View className="flex-1">
                <Tabs screenOptions={{ headerShown: false, tabBarIcon: () => null, tabBarActiveTintColor: '#029834', tabBarInactiveTintColor: 'gray', }}>
                    <Tabs.Screen name="viaggi" options={{ title: 'Viaggi', }} />
                    <Tabs.Screen name="trazioni" options={{ title: 'Trazioni' }} />
                </Tabs>

                <TouchableOpacity
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-greenCeccarelli-primary justify-center items-center shadow-lg"
                    onPress={() => router.push("/(app)/trazione")}>
                    <FontAwesome name="plus" size={32} color="white" />
                </TouchableOpacity>
            </View>
        </>
    );
}
