import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const BASE_URL = "http://api2.ceccarelligroup.it";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("auth_token");
    if (token) {
        config.headers["Token"] = token;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("Errore API:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;