import { TrazioneForm } from '@/app/lib/types/trazione';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, Text, TextInput, View } from 'react-native';
import api from '../lib/api/api';
import { Viaggio } from '../lib/types/viaggio';


export default function CreaTrazione() {
    const router = useRouter();

    const [form, setForm] = useState<TrazioneForm>({
        targa: '',
        vettore: '',
        sigillo1: '',
        sigillo2: '',
        autista: '',
        dataOraArrivo: new Date(),
        viaggiAssociati: [],
        note: '',
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [viaggi, setViaggi] = useState<Viaggio[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        api
            .get(`/api/logistica/arrivi/viaggi`, {
                params: {
                    includiViaggiChiusi:
                        false,
                    includiSpedizioni:
                        false,
                    filiale: "UD",
                    grandezzaPagina: 1000,
                },
            })
            .then((response) => {
                setViaggi(response.data);
            })
            .catch((err) => {
                setError(err.message || "Errore durante il caricamento");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Funzione per aggiornare form
    const handleChange = (name: string, value: any) => {
        setForm({ ...form, [name]: value });
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (event.type === "set" && selectedDate) {
            handleChange('dataOraArrivo', selectedDate);
        }
        setShowDatePicker(false);
    };

    const handleSubmit = () => {
        console.log('Dati da salvare:', form);
        router.back();
    };

    return (
        <ScrollView className="p-4 bg-white">
            <View className="p-4">
                <View className="mb-4">
                    <Text className="mb-1">Targa</Text>
                    <TextInput
                        value={form.targa}
                        onChangeText={(text) => handleChange('targa', text)}
                        placeholder="Inserisci targa"
                        className="border border-gray-300 rounded px-3 py-2"
                    />
                </View>
                <View className="mb-4">
                    <Text className="mb-1">Vettore</Text>
                    <TextInput
                        value={form.vettore}
                        onChangeText={(text) => handleChange('vettore', text)}
                        placeholder="Inserisci vettore"
                        className="border border-gray-300 rounded px-3 py-2"
                    />
                </View>
                <View className="mb-4">
                    <Text className="mb-1">Sigillo 1</Text>
                    <TextInput
                        value={form.sigillo1}
                        onChangeText={(text) => handleChange('sigillo1', text)}
                        placeholder="Inserisci sigillo 1"
                        className="border border-gray-300 rounded px-3 py-2"
                    />
                </View>
                <View className="mb-4">
                    <Text className="mb-1">Sigillo 2</Text>
                    <TextInput
                        value={form.sigillo2}
                        onChangeText={(text) => handleChange('sigillo2', text)}
                        placeholder="Inserisci sigillo 2"
                        className="border border-gray-300 rounded px-3 py-2"
                    />
                </View>
                <View className="mb-4">
                    <Text className="mb-1">Autista</Text>
                    <TextInput
                        value={form.autista}
                        onChangeText={(text) => handleChange('autista', text)}
                        placeholder="Inserisci autista"
                        className="border border-gray-300 rounded px-3 py-2"
                    />
                </View>
                <View className="mb-4">
                    <Text className="mb-1">Data e Ora Arrivo</Text>
                    <Button
                        title={form.dataOraArrivo.toLocaleString()}
                        onPress={() => setShowDatePicker(true)}
                        color="#029834"
                    />
                </View>
                {showDatePicker && (
                    <DateTimePicker
                        value={form.dataOraArrivo}
                        mode="datetime"
                        display="default"
                        onChange={handleDateChange}
                    />
                )}
                <View className="mb-4">
                    <Text className="mb-1">Note</Text>
                    <TextInput
                        value={form.note}
                        onChangeText={(text) => handleChange('note', text)}
                        placeholder="Inserisci note"
                        multiline
                        numberOfLines={4}
                        className="border border-gray-300 rounded px-3 py-2"
                    />
                </View>
            </View>
            <Button title="Salva" onPress={handleSubmit} color={"#029834"} />
        </ScrollView>
    );
}
