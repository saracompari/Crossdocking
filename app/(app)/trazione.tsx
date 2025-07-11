import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, ScrollView, Text, TextInput, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ValidatedTextInput from '../components/ValidatedTextInput';
import api from '../lib/api/api';
import { Trazione } from '../lib/types/trazione';
import { Viaggio } from '../lib/types/viaggio';

export default function FormTrazione() {
    const router = useRouter();
    const { serialTrazione } = useLocalSearchParams<{ serialTrazione?: string }>();

    const [form, setForm] = useState<Trazione>({
        targa: '',
        vettore: '',
        sigillo1: '',
        sigillo2: '',
        autista: '',
        dataOraArrivo: new Date(),
        viaggi: [],
        note: '',
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viaggiList, setViaggiList] = useState<Viaggio[]>([]);
    const [viaggiOptions, setViaggiOptions] = useState<{ label: string; value: number }[]>([]);
    const [selectedSerials, setSelectedSerials] = useState<number[]>([]);
    const [open, setOpen] = useState(false);
    const [validations, setValidations] = useState({ targa: false, vettore: false, });

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

    useEffect(() => {
        if (serialTrazione) {
            setLoading(true);
            api
                .get(`/api/logistica/arrivi/trazioni/${serialTrazione}`)
                .then((res) => {
                    const data = res.data;
                    setForm({
                        ...data,
                        dataOraArrivo: new Date(data.dataOraArrivo),
                    });
                    setSelectedSerials(data.viaggi.map((v: any) => v.serial));
                })
                .catch((err) => {
                    setError('Errore nel caricamento della trazione');
                    console.error(err);
                })
                .finally(() => setLoading(false));
        }
    }, [serialTrazione]);

    function handleChange(key: string, value: any) {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    function handleValidation(key: string, isValid: boolean) {
        setValidations(prev => ({ ...prev, [key]: isValid }));
    }

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
            filiale: 'UD',
        };

        try {
            const res = serialTrazione
                ? await api.put(`/api/logistica/arrivi/trazioni/${serialTrazione}`, payload)
                : await api.post('/api/logistica/arrivi/trazioni', payload);

            const serial = res.data.serial || serialTrazione;
            Alert.alert('Successo', 'Trazione salvata con successo');
            router.push({
                pathname: '/trazione/[serialTrazione]',
                params: { serialTrazione: String(serial) },
            });
        } catch (err) {
            console.error(err);
            setError('Errore durante il salvataggio');
            Alert.alert('Errore', 'Errore durante il salvataggio');
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = Object.values(validations).every(v => v === true);

    return (
        <ScrollView className="p-4 bg-white">
            <View className="p-4">
                <View className="mb-4">
                    <Text className="mb-1">Targa</Text>
                    <ValidatedTextInput
                        name="targa"
                        value={form.targa}
                        onChangeText={(text) => handleChange("targa", text)}
                        placeholder="Targa" required
                        onValidate={(isValid) => handleValidation("targa", isValid)}
                        maxLength={7} />
                </View>
                <View className="mb-4">
                    <Text className="mb-1">Vettore</Text>
                    <ValidatedTextInput
                        name="vettore"
                        value={form.vettore}
                        onChangeText={(text) => handleChange("vettore", text)}
                        placeholder="Vettore" required
                        onValidate={(isValid) => handleValidation("vettore", isValid)} />
                </View>
                <View className="mb-4">
                    <Text className="mb-1">Sigillo #1</Text>
                    <TextInput
                        value={form.sigillo1}
                        onChangeText={(text) => handleChange("sigillo1", text)}
                        placeholder="Sigillo #1"
                        className="border border-gray-300 rounded px-3 py-2" />
                </View>
                <View className="mb-4">
                    <Text className="mb-1">Sigillo #2</Text>
                    <TextInput
                        value={form.sigillo2}
                        onChangeText={(text) => handleChange("sigillo2", text)}
                        placeholder="Sigillo #2"
                        className="border border-gray-300 rounded px-3 py-2" />
                </View>
                <View className="mb-4">
                    <Text className="mb-1">Autista</Text>
                    <TextInput
                        value={form.autista}
                        onChangeText={(text) => handleChange("autista", text)}
                        placeholder="Autista"
                        className="border border-gray-300 rounded px-3 py-2" />
                </View>
                <View className="mb-4">
                    <Text className="mb-1">Arrivato alle</Text>
                    <Button
                        title={form.dataOraArrivo.toLocaleString()}
                        onPress={() => setShowDatePicker(true)}
                        color="#029834" />
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
                        dropDownContainerStyle={{ borderColor: '#ccc' }} />
                </View>
                <View className="mb-4">
                    <Text className="mb-1">Note</Text>
                    <TextInput
                        value={form.note}
                        onChangeText={(text) => handleChange('note', text)}
                        placeholder="Inserisci note"
                        className="border border-gray-300 rounded px-3 py-2" />
                </View>
                <Button disabled={!isFormValid} title="Salva" onPress={handleSubmit} color="#029834" />
            </View>
        </ScrollView >
    );
}
