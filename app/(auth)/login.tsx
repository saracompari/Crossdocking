import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { login } from "../lib/api/auth";

export default function LoginPage() {
    const [utente, setUtente] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        try {
            setLoading(true);
            await login(utente, password);
            router.replace("/(app)");
        } catch (err: any) {
            Alert.alert("Errore", err.message || "Login fallito");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 justify-center px-6 bg-white">
            <TextInput
                placeholder="Utente"
                value={utente}
                onChangeText={setUtente}
                className="border-b border-gray-300 mb-4 p-2"
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="border-b border-gray-300 mb-6 p-2"
            />
            <Pressable
                onPress={handleLogin}
                disabled={loading}
                className={`bg-greenCeccarelli-primary rounded-md py-3 ${loading ? "opacity-50" : "opacity-100"}`}
            >
                <Text className="text-center text-white text-base font-semibold">
                    {loading ? "Caricamento..." : "Accedi"}
                </Text>
            </Pressable>
        </View>
    );
}
