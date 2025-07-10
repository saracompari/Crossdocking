import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const login = async (utente: string, password: string) => {
    try {
        const response = await axios.post("http://api2.ceccarelligroup.it/api/sicurezza/login", {
            utente,
            password,
        });

        const token = response.data?.token;
        if (!token) {
            throw new Error("Token mancante nella risposta");
        }

        console.log(token)

        await AsyncStorage.setItem("auth_token", token);
        return token;
    } catch (err: any) {
        console.error("Login error:", err.message);
        console.error("Full error:", err);
        throw new Error(err?.message || "Errore di rete");
    }
};
