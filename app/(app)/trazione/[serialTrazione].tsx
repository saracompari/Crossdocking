import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function DettaglioTrazione() {
    const { serialTrazione } = useLocalSearchParams();

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20 }}>Trazione: {serialTrazione}</Text>
        </View>
    );
}