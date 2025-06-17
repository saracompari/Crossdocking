import { Tabs } from 'expo-router';

export default function ListaViaggiTabsLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="viaggi" options={{ title: 'Viaggi' }} />
            <Tabs.Screen name="trazioni" options={{ title: 'Trazioni' }} />
        </Tabs>
    );
}