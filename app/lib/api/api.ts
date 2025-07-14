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
    (response) => {
        const pagination = response.headers['x-pagination'];
        const filters = response.headers['x-filters'];

        if (pagination) {
            try {
                const parsedPagination = JSON.parse(pagination);
                console.log('Paginazione:', parsedPagination);
            } catch (e) {
                console.warn('x-pagination non è JSON valido:', pagination);
            }
        }

        if (filters) {
            try {
                const parsedFilters = JSON.parse(filters);
                console.log('Filtri:', parsedFilters);
            } catch (e) {
                console.warn('x-filters non è JSON valido:', filters);
            }
        }

        return response;
    },
    (error) => {
        console.error("Errore API:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;