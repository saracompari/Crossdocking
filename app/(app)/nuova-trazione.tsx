import { TrazioneForm } from '@/app/lib/types/trazione';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viaggiList, setViaggiList] = useState<Viaggio[]>([]);
    const [viaggiOptions, setViaggiOptions] = useState<{ label: string; value: number }[]>([]);
    const [selectedSerials, setSelectedSerials] = useState<number[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(null);

        api
            .get(`/api/logistica/arrivi/viaggi`, {
                params: {
                    includiViaggiChiusi: false,
                    includiSpedizioni: false,
                    filiale: "UD",
                    grandezzaPagina: 1000,
                },
            })
            .then((response) => {
                const viaggi = response.data;
                setViaggiList(viaggi);
                setViaggiOptions(
                    viaggi.map((v: Viaggio) => ({
                        label: (
                            <View className="flex-row justify-between items-start flex-wrap">
                                <View className="flex-1 pr-2">
                                    <Text className="font-bold flex-wrap">{v.descrizione}</Text>
                                    <Text className="text-xs text-gray-500">
                                        {v.numeroDocumento} del {dayjs(v.dataArrivo).format('DD/MM/YYYY')}
                                    </Text>
                                </View>
                                <View className="w-14 items-end">
                                    <Text className="font-bold text-right">
                                        {v.numeroSpedizioniConfermate}/{v.numeroSpedizioniTotali}
                                    </Text>
                                </View>
                            </View>
                        ),
                        value: v.serial,
                    }))
                );
            })
            .catch((err) => {
                setError(err.message || "Errore durante il caricamento");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleChange = (name: string, value: any) => {
        setForm({ ...form, [name]: value });
    };

    const handleConfirmDate = (selectedDate: Date) => {
        handleChange('dataOraArrivo', selectedDate);
        setShowDatePicker(false);
    };

    const hideDatePicker = () => {
        setShowDatePicker(false);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        const payload = {
            ...form,
            serialViaggi: selectedSerials,
            dataOraArrivo: form.dataOraArrivo.toISOString(),
            filiale: "UD",
        };

        try {
            const response = await api.post("/api/logistica/arrivi/trazioni", payload);
            const serialTrazione = response.data.serial;
            alert("Trazione salvata con successo!");
            router.push({
                pathname: "/trazione/[serialTrazione]",
                params: { serialTrazione: String(serialTrazione) },
            });
        } catch (err) {
            console.error("Errore durante l'invio:", err);
            setError("Errore durante l'invio del modulo");
            alert("Errore durante il salvataggio. Riprova.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="p-4 bg-white">
            <View className="p-4">
                {[
                    { key: 'targa', label: 'Targa' },
                    { key: 'vettore', label: 'Vettore' },
                    { key: 'sigillo1', label: 'Sigillo #1' },
                    { key: 'sigillo2', label: 'Sigillo #2' },
                    { key: 'autista', label: 'Autista' },
                ].map(({ key, label }) => (
                    <View className="mb-4" key={key}>
                        <Text className="mb-1">{label}</Text>
                        <TextInput
                            value={(form as any)[key]}
                            onChangeText={(text) => handleChange(key, text)}
                            placeholder={label}
                            className="border border-gray-300 rounded px-3 py-2"
                        />
                    </View>
                ))}

                <View className="mb-4">
                    <Text className="mb-1">Arrivato alle</Text>
                    <Button
                        title={form.dataOraArrivo.toLocaleString()}
                        onPress={() => setShowDatePicker(true)}
                        color="#029834"
                    />
                </View>

                {showDatePicker && (
                    <DateTimePickerModal
                        isVisible={showDatePicker}
                        mode="datetime"
                        date={form.dataOraArrivo}
                        onConfirm={handleConfirmDate}
                        onCancel={hideDatePicker}
                    />
                )}

                <View className="mb-4 z-10">
                    <Text className="mb-2">Viaggi associati</Text>
                    <DropDownPicker
                        open={open}
                        setOpen={setOpen}
                        items={viaggiOptions}
                        setItems={setViaggiOptions}
                        multiple={true}
                        value={selectedSerials}
                        setValue={setSelectedSerials}
                        placeholder="Seleziona i viaggi"
                        mode="BADGE"
                        badgeColors={['#029834']}
                        badgeDotColors={['#fff']}
                        style={{ borderColor: '#ccc' }}
                        dropDownContainerStyle={{ borderColor: '#ccc' }}
                    />
                </View>

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

                <Button title="Salva" onPress={handleSubmit} color="#029834" />
            </View>
        </View>
    );
}
