// app/lib/user.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class User {
    #id = null;
    #nome = null;
    #cognome = null;
    #azienda = null;
    #permessi = [];

    constructor(data: any = {}) {
        this.#id = data.id || null;
        this.#nome = data.nome || null;
        this.#cognome = data.cognome || null;
        this.#azienda = data.azienda || null;
        this.#permessi = data.permessi || [];
    }

    get id() {
        return this.#id;
    }
    set id(id) {
        this.#id = id;
    }

    get nome() {
        return this.#nome;
    }
    set nome(nome) {
        this.#nome = nome;
    }

    get cognome() {
        return this.#cognome;
    }
    set cognome(cognome) {
        this.#cognome = cognome;
    }

    get azienda() {
        return this.#azienda;
    }
    set azienda(azienda) {
        this.#azienda = azienda;
    }

    get permessi() {
        return this.#permessi;
    }
    set permessi(permessi) {
        this.#permessi = permessi;
    }

    toJSON() {
        return {
            id: this.#id,
            nome: this.#nome,
            cognome: this.#cognome,
            azienda: this.#azienda,
            permessi: this.#permessi,
        };
    }
}

// Salva l'utente in AsyncStorage
export async function setUser(user: User) {
    await AsyncStorage.setItem('user', JSON.stringify(user.toJSON()));
}

// Recupera l'utente da AsyncStorage
export async function getUser() {
    const json = await AsyncStorage.getItem('user');
    if (!json) return null;

    const data = JSON.parse(json);
    return new User(data);
}

// Cancella l'utente da AsyncStorage (per il logout)
export async function removeUser() {
    await AsyncStorage.removeItem('user');
}
