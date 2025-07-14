import { TableUtils } from '@/app/components/TableUtils';
import api from '@/app/lib/api/api';
import { Spedizione } from '@/app/lib/types/spedizione';
import { Trazione } from '@/app/lib/types/trazione';
import { FontAwesome } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { router, useLocalSearchParams, } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
        <>
            <View className="bg-white p-4 rounded-lg shadow m-2">
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
                            <ScrollView horizontal showsHorizontalScrollIndicator={true} className="mt-2">
                                <View className="flex-row flex-nowrap">
                                    {data.viaggi.map((viaggio, index) => (
                                        <View key={index} className="bg-cyan-400 rounded-full px-3 py-1 mr-2">
                                            <Text className="text-white font-semibold text-sm">{viaggio.numeroDocumento || ''}</Text>
                                            <Text className="text-white text-xs">{viaggio.descrizione || 'N/A'}</Text>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        )}
                    </View>
                    <View className="justify-between items-end">
                        <TouchableOpacity
                            className={`rounded px-3 py-2 mb-2 flex-row items-center ${isTerminated ? "bg-green-600" : "bg-yellow-400"}`}>
                            {loading && <ActivityIndicator color="#fff" className="mr-2" />}
                            <Text className={`${!isTerminated ? "text-black" : "text-white"}`}>
                                {isTerminated ? "Trazione Terminata" : "Termina trazione"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-greenCeccarelli-primary px-3 py-2 rounded items-center">
                            <FontAwesome name="print" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
                <TextInput placeholder="Scansiona il barcode" className="border border-gray-300 rounded px-3 py-2" />
            </View>
            <Spedizioni trazione={data}></Spedizioni>
        </>
    );
}


function FiltriSpedizioni({ filtri, setFiltro, onSubmit, filters, handleSuccessFilters }: any) {
    const { query } = filtri;

    const onChangeQuery = (text: string) => {
        setFiltro({ ...filtri, query: text });
    };

    const onQuickFilterPress = (item: string) => {
        const next = { ...filtri, query: item };
        setFiltro(next);
        handleSuccessFilters(next);
    };

    const onReset = () => {
        const reset = { ...filtri, query: "" };
        setFiltro(reset);
        handleSuccessFilters(reset);
    };

    return (
        <View className="px-2">
            <View className="flex-row items-center space-x-2 mb-2">
                <TextInput
                    className="flex-1 border border-gray-300 bg-white rounded px-3 py-1 text-sm"
                    placeholder="Cerca..."
                    value={query ?? ""}
                    onChangeText={onChangeQuery}
                />
                <TouchableOpacity className="bg-greenCeccarelli-primary px-4 py-2 rounded" onPress={onSubmit}>
                    <Text className="text-white text-sm font-semibold">Filtra</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                {filters?.map((item: string, index: number) => (
                    <TouchableOpacity
                        key={index}
                        className="border border-gray-300 rounded px-3 py-1 mr-2 bg-white"
                        onPress={() => onQuickFilterPress(item)}
                    >
                        <Text className="text-gray-800 text-sm">{item}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity className="border border-red-500 rounded px-3 py-1 bg-white" onPress={onReset}>
                    <View className="flex-row items-center space-x-1">
                        <FontAwesome name="undo" size={12} color="red" />
                        <Text className="text-red-500 text-sm">Reset</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

function Spedizioni({ trazione }: any) {
    const { serial: serialTrazione } = trazione;
    const [data, setData] = useState<Spedizione[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtri, setFiltri] = useState({
        query: "",
        includiColli: true,
        includiDimensioni: true,
    });
    const [filters, setFilters] = useState<string[] | null>(null);

    useEffect(() => {
        if (serialTrazione) {
            caricaSpedizioni();
        }
    }, [serialTrazione]);

    const caricaSpedizioni = (nextFilters = filtri) => {
        setLoading(true);
        setError(null);
        api
            .get(`/api/logistica/arrivi/trazioni/${serialTrazione}/spedizioni`, {
                params: {
                    ...nextFilters,
                    grandezzaPagina: 1000,
                },
            })
            .then((res) => {
                setData(res.data);
                setLoading(false);

                const filtersHeader = res.headers["x-filters"];
                if (filtersHeader) {
                    try {
                        const parsedFilters = JSON.parse(filtersHeader);
                        setFilters(parsedFilters);
                    } catch (e) {
                        console.warn("Errore nel parsing di x-filters");
                    }
                }
            })
            .catch((err) => {
                console.warn("Errore nel caricamento spedizioni", err);
                setLoading(false);

            });
    };

    const handleSuccessFilters = (nextFilters: any) => {
        setFiltri(nextFilters);
        caricaSpedizioni(nextFilters);
    };

    const onSubmit = () => {
        caricaSpedizioni(filtri);
    };

    const renderItem = ({ item }: { item: any }) => (
        <Pressable className="bg-white p-4 my-1 rounded-lg shadow">
            <View>
                <TouchableOpacity className="flex-row justify-between items-center">
                    <Text className="text-base font-bold w-1/2">{item.numeroDocumento}</Text>
                    <Text className="font-bold w-1/4 text-right">
                        {item.epalSegnalati}/{item.epalPrevisti}
                    </Text>
                </TouchableOpacity>

                <View className="flex-row mt-1">
                    <View className="w-2/3">
                        <Text className="text-xs text-gray-500">Cliente: {item.cliente || "N/A"}</Text>
                        <Text className="text-xs text-gray-500">Mittente: {item.mittente || "N/A"}</Text>
                        <Text className="text-xs text-gray-500">Destinatario: {item.destinatario || "N/A"}</Text>
                    </View>
                    <View className="w-1/3 items-end">
                        <Text className="text-xs text-gray-500">{item.pesoComplessivo || "N/A"} kg</Text>
                        <Text className="text-xs text-gray-500">{item.volumeComplessivo || "N/A"} m³</Text>
                    </View>
                </View>

                <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-500">
                        Rif.Int: {item.rifInterno || "N/A"} Rif.Est: {item.rifEsterno || "N/A"}
                    </Text>
                </View>
            </View>
        </Pressable>
    );

    return (
        <>
            <FiltriSpedizioni filters={filters} filtri={filtri} setFiltro={setFiltri} onSubmit={onSubmit} handleSuccessFilters={handleSuccessFilters} />
            {!loading && !error && data.length === 0 && <TableUtils.NoResult />}
            <FlatList className="px-2" data={data} renderItem={renderItem} keyExtractor={(item) => item.id?.toString() || Math.random().toString()} />
        </>
    );
}

