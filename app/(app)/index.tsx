import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
    return (
        <View className="flex-1 bg-white justify-center items-center px-4">
            <TouchableOpacity
                onPress={() => router.push('/listaViaggi/viaggi')}
                className="bg-greenCeccarelli-primary rounded-lg p-6 mb-6 w-full max-w-md shadow-lg"
                activeOpacity={0.8}
            >
                <Text className="text-white text-xl font-bold text-center mb-2">ARRIVI</Text>
                <Text className="text-white text-center">Visualizza i dettagli degli arrivi.</Text>
            </TouchableOpacity>

            <View className="bg-greenCeccarelli-light rounded-lg p-6 mb-6 w-full max-w-md shadow-lg opacity-50">
                <Text className="text-white text-xl font-bold text-center mb-2">PARTENZE</Text>
                <Text className="text-white text-center">Consulta le partenze programmate.</Text>
            </View>

            <View className="bg-greenCeccarelli-light rounded-lg p-6 mb-6 w-full max-w-md shadow-lg opacity-50">
                <Text className="text-white text-xl font-bold text-center mb-2">RILEVAZIONI</Text>
                <Text className="text-white text-center">Accedi alle rilevazioni in corso.</Text>
            </View>
        </View>
    );
}