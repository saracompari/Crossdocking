import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const login = async (utente: string, password: string,) => {
    try {
        const response = await axios.post("http://api2.ceccarelligroup.it/api/sicurezza/login", {
            utente,
            password,
        });

        const token = response.data?.token;
        const validita = response.data?.validita;

        if (!token || !validita) {
            throw new Error("Token o validità mancanti nella risposta");
        }

        await AsyncStorage.setItem("auth_token", token);
        await AsyncStorage.setItem("auth_validita", validita);
        return token;
    } catch (err: any) {
        console.error("Login error:", err.message);
        console.error("Full error:", err);
        throw new Error(err?.message || "Errore di rete");
    }
};
