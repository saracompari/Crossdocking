import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUser } from './user';

export default class Token {
    async getToken() {
        return await AsyncStorage.getItem('auth_token');
    }

    async getValidita(): Promise<Date | null> {
        const validita = await AsyncStorage.getItem("auth_validita");
        return validita ? new Date(validita) : null;
    }

    async saveAuthentication(token: string, callback: (() => void) | null = null) {
        await this.saveCustomAuthentication(null, token, callback);
    }

    async saveCustomAuthentication(way: string | null, token: string, callback: (() => void) | null = null) {
        if (way) await AsyncStorage.setItem('auth_way', way);
        await AsyncStorage.setItem('auth_token', token);

        if (callback) callback();
    }

    async isAuthenticated(): Promise<boolean> {
        const token = await this.getToken();
        return token !== null;
    }

    async logout(): Promise<string | null> {
        const way = await AsyncStorage.getItem('auth_way');

        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('auth_way');

        return way;
    }

    async isGranted(role: string): Promise<boolean> {
        if (role === "IS_AUTHENTICATED") {
            return await this.isAuthenticated();
        }

        return await hasRole(role);
    }
}


export async function hasRole(role: string): Promise<boolean> {
    if (!role) return false;

    const user = await getUser();
    if (!user) return false;

    const roles = [
        ...user.permessi,
        ...user.permessi.map((perm: string) => "ROLE_" + perm.toUpperCase()),
    ];

    return roles.includes(role.toUpperCase());
}

export const token = new Token();
