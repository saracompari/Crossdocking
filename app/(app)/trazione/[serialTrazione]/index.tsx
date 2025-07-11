import { TableUtils } from '@/app/components/TableUtils';
import api from '@/app/lib/api/api';
import { Trazione } from '@/app/lib/types/trazione';
import { FontAwesome } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { router, useLocalSearchParams, } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Dettaglio() {
    const { serialTrazione } = useLocalSearchParams<{ serialTrazione?: string }>();
    const [data, setData] = useState<Trazione | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (!serialTrazione) return;

        setLoading(true);
        setError(null);

        api.get(`/api/logistica/arrivi/trazioni/${serialTrazione}`)
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || "Errore durante il caricamento");
                setLoading(false);
            });
    }, [serialTrazione]);

    const [isTerminated, setIsTerminated] = useState(data?.tsConferma);

    const handleEdit = () => {
        router.push({
            pathname: "/trazione/[serialTrazione]/modifica",
            params: { serialTrazione: String(data?.serial) },
        })
    };

    if (loading) return <TableUtils.Loading>Caricamento dei dettagli...</TableUtils.Loading>;
    if (error) return <TableUtils.Error>{error}</TableUtils.Error>;
    if (!data) return <TableUtils.NoResult>Nessun dettaglio disponibile.</TableUtils.NoResult>;

    return (
        <ScrollView className="bg-white p-4 rounded-lg shadow m-2">
            <View className="flex-row justify-between mb-3">
                <View className="flex-1 pr-2">
                    <View className="flex-row items-center flex-wrap">
                        <Text className="text-xl font-bold">
                            {data.targa} {data.vettore || "N/A"}
                        </Text>
                        {!data.tsConferma && (
                            <TouchableOpacity className="ml-2" onPress={() => handleEdit()}>
                                <FontAwesome name="pencil" size={16} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text className="text-base text-gray-600 mt-1">
                        Del {data.dataOraArrivo ? dayjs(data.dataOraArrivo).format("DD/MM/YYYY HH:mm") : "N/A"}
                    </Text>

                    {data.viaggi?.length > 0 && (
                        <View className="flex-row flex-wrap mt-2">
                            {data.viaggi.map((viaggio, index) => (
                                <View key={index} className="bg-cyan-400 rounded-full px-3 py-1 mr-2 mt-2">
                                    <Text className="text-white font-semibold text-sm">
                                        {viaggio.numeroDocumento || ''}
                                    </Text>
                                    <Text className="text-white text-xs">
                                        {viaggio.descrizione || 'N/A'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
                <View className="justify-between items-end">
                    <TouchableOpacity
                        className={`rounded px-3 py-2 mb-2 flex-row items-center ${isTerminated ? "bg-green-600" : "bg-yellow-500"}`}>
                        {loading && <ActivityIndicator color="#fff" className="mr-2" />}
                        <Text className="text-white font-semibold">
                            {isTerminated ? "Trazione Terminata" : "Termina trazione"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-greenCeccarelli-primary px-3 py-2 rounded items-center">
                        <FontAwesome name="print" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
            <TextInput placeholder="Scansiona il barcode" className="border border-gray-300 rounded px-3 py-2" />
        </ScrollView>
    );
}
