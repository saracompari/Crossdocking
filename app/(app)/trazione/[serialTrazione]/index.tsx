import { TableUtils } from '@/app/components/TableUtils';
import api from '@/app/lib/api/api';
import { Spedizione } from '@/app/lib/types/spedizione';
import { Trazione } from '@/app/lib/types/trazione';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { router, useLocalSearchParams, } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Dettaglio() {
    const { serialTrazione } = useLocalSearchParams<{ serialTrazione?: string }>();
    const [data, setData] = useState<Trazione | null>(null);
    const [dataSpedizioni, setDataSpedizioni] = useState<Spedizione[]>([]);
    const [filtri, setFiltri] = useState({
        query: "",
        includiColli: true,
        includiDimensioni: true,
    });
    const [filtersHeader, setFiltersHeader] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printerPath, setPrinterPath] = useState('');
    const [showTerminaModal, setShowTerminaModal] = useState(false);
    const spedizioniConMancanze = dataSpedizioni?.filter(s => s.numeroColliConfermati < s.numeroColliTotali) ?? [];
    const spedizioniConEpalSegnalati = dataSpedizioni?.filter(s => s.epalPrevisti !== s.epalSegnalati) ?? [];

    useEffect(() => {
        if (!serialTrazione) return;
        caricaTrazione();
        caricaSpedizioni();
    }, [serialTrazione]);

    const [isTerminated, setIsTerminated] = useState(data?.tsConferma);

    const caricaSpedizioni = (f = filtri) => {
        api.get(`/api/logistica/arrivi/trazioni/${serialTrazione}/spedizioni`, {
            params: { ...f, grandezzaPagina: 1000 },
        })
            .then((res) => {
                setDataSpedizioni(res.data);
                const header = res.headers["x-filters"];
                if (header) {
                    try {
                        setFiltersHeader(JSON.parse(header));
                    } catch {
                        console.warn("x-filters non è un JSON valido");
                    }
                }
            })
            .catch(console.warn);
    };

    const caricaTrazione = async () => {
        if (!serialTrazione) return;

        try {
            setLoading(true);
            const res = await api.get(`/api/logistica/arrivi/trazioni/${serialTrazione}`);
            setData(res.data);
            setIsTerminated(res.data.tsConferma);
            setLoading(false);
        } catch {
            setLoading(false);
        }
    };

    const handleSaltaStampa = async () => {
        if (!serialTrazione) return;

        try {
            await api.put(`/api/logistica/arrivi/trazioni/${serialTrazione}/etichetta`);
            setShowPrintModal(false);
            await caricaTrazione();
        } catch (err) {
            console.error("Errore nel saltare la stampa etichetta:", err);
        }
    };

    const terminaTrazione = () => {
        console.log("Trazione terminata");
    };

    const handleEdit = () => {
        router.push({
            pathname: "/trazione/[serialTrazione]/modifica",
            params: { serialTrazione: String(data?.serial) },
        })
    };

    const savePrinterPath = async () => {
        try {
            await AsyncStorage.setItem('printerPath', printerPath);
        } catch (e) {
            console.error('Errore salvataggio stampante', e);
        }
    };

    const handleSuccessFilters = (nextFilters: any) => {
        setFiltri(nextFilters);
        caricaSpedizioni(nextFilters);
    };

    const onSubmit = () => {
        caricaSpedizioni(filtri);
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
                            className={`rounded px-3 py-2 mb-2 flex-row items-center ${isTerminated ? "bg-green-600" : "bg-yellow-400"}`}
                            onPress={() => setShowTerminaModal(true)}>
                            <Text className={`${!isTerminated ? "text-black" : "text-white"}`}>
                                {isTerminated ? "Trazione Terminata" : "Termina trazione"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-greenCeccarelli-primary px-3 py-2 rounded items-center"
                            onPress={() => setShowPrintModal(true)}>
                            <FontAwesome name="print" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
                <TextInput placeholder="Scansiona il barcode" className="border border-gray-300 rounded px-3 py-2" />
            </View>
            <FiltriSpedizioni filtri={filtri} filters={filtersHeader} setFiltro={setFiltri} onSubmit={onSubmit} handleSuccessFilters={handleSuccessFilters} />
            <Spedizioni trazione={data} dataSpedizioni={dataSpedizioni} />
            <Modal transparent animationType="slide" visible={showTerminaModal} onRequestClose={() => setShowTerminaModal(false)}>
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-white rounded-lg p-6 w-11/12 max-w-md">
                        <Text className="text-lg font-bold mb-4">Termina trazione</Text>

                        {spedizioniConMancanze.length > 0 && (
                            <>
                                <Text className="mb-2">Le seguenti spedizioni contengono colli non confermati:</Text>
                                {spedizioniConMancanze.map((sped, index) => (
                                    <Text key={index} className="text-red-600 text-sm ml-2">
                                        • {sped.numeroDocumento} - Confermati {sped.numeroColliConfermati} su {sped.numeroColliTotali}
                                    </Text>
                                ))}
                            </>
                        )}

                        {spedizioniConEpalSegnalati.length > 0 && (
                            <>
                                <Text className="mt-4 mb-2">
                                    Le seguenti spedizioni hanno un numero di epal segnalati difforme da quanto previsto:
                                </Text>
                                {spedizioniConEpalSegnalati.map((sped, index) => (
                                    <Text key={index} className="text-red-600 text-sm ml-2">
                                        • {sped.numeroDocumento} - Segnalati {sped.epalSegnalati} su {sped.epalPrevisti}
                                    </Text>
                                ))}
                            </>
                        )}

                        <Text className="mt-4">Sei sicuro di voler terminare la trazione?</Text>

                        <View className="flex-row justify-end mt-6 space-x-2">
                            <TouchableOpacity
                                onPress={() => setShowTerminaModal(false)}
                                className="bg-gray-300 px-4 py-2 rounded"
                            >
                                <Text>Annulla</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    setShowTerminaModal(false);
                                    terminaTrazione();
                                }}
                                className="bg-red-600 px-4 py-2 rounded"
                            >
                                <Text className="text-white">Termina</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>
            <Modal transparent animationType="slide" visible={showPrintModal} onRequestClose={() => setShowPrintModal(false)}>
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-white rounded-lg p-6 w-11/12 max-w-md">
                        <Text className="text-lg font-bold mb-4">Opzioni di stampa</Text>
                        <Text className="mb-2">Inserisci il codice della stampante</Text>
                        <TextInput className="border border-gray-300 rounded px-3 py-2 mb-4"
                            placeholder="es. 192.168.1.69" value={printerPath} onChangeText={setPrinterPath} />
                        <View className="flex-row justify-end space-x-2 gap-2">
                            <TouchableOpacity className="px-4 py-2 bg-gray-600 rounded" onPress={() => setShowPrintModal(false)}>
                                <Text className='text-white'>Annulla</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="px-4 py-2 bg-greenCeccarelli-primary rounded disabled:opacity-50"
                                disabled={!printerPath.trim()}
                                onPress={() => {
                                    setShowPrintModal(false);
                                }}>
                                <Text className='text-white'>Salva</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
                                onPress={() => {
                                    handleSaltaStampa();
                                    setShowPrintModal(false);
                                }}>
                                <Text className="text-white">Salta stampa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
                <TouchableOpacity className="bg-greenCeccarelli-primary px-4 ms-1 py-1 rounded" onPress={onSubmit}>
                    <Text className="text-white text-sm font-semibold">Filtra</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                {filters?.map((item: string, index: number) => (
                    <TouchableOpacity
                        key={index}
                        className="border border-gray-300 rounded px-3 py-1 mr-2 bg-white"
                        onPress={() => onQuickFilterPress(item)}>
                        <Text className="text-gray-800 text-sm">{item}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity className="border border-red-500 rounded px-3 py-1 bg-white" onPress={onReset}>
                    <View className="flex-row items-center space-x-1">
                        <FontAwesome name="undo" size={12} color="red" />
                        <Text className="text-red-500 text-sm ms-1">Reset</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

function Spedizioni({ trazione, dataSpedizioni, }: any) {

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
                <View>
                    {item.etichettata ? (
                        <View className="flex-1">
                            {item.colli.map((collo: any, index: number) => (
                                <TouchableOpacity key={collo.serial || index}
                                    className="px-2 mt-1 py-1 bg-gray-100 rounded shadow-sm"
                                    onPress={() => { console.log('Clicked barcode:', collo.barcode); }}>
                                    <Text className="text-sm text-gray-800">{collo.barcode}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <TouchableOpacity className="bg-greenCeccarelli-primary px-3 py-2 rounded items-center self-end mt-2">
                            <FontAwesome name="print" size={16} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Pressable>
    );

    return (
        <>
            <FlatList className="px-2" data={dataSpedizioni} renderItem={renderItem} keyExtractor={(item) => item.id?.toString() || Math.random().toString()} />
        </>
    );
}

