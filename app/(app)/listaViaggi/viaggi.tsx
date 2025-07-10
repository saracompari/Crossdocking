import { TableUtils } from '@/app/components/TableUtils';
import api from '@/app/lib/api/api';
import { Viaggio } from '@/app/lib/types/viaggio';
import { FontAwesome } from '@expo/vector-icons';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

export default function Lista() {
    const [viaggi, setViaggi] = useState<Viaggio[]>([]);
    const [loading, setLoading] = useState(true);
    const [errore, setErrore] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const res = await api.get<Viaggio[]>("/api/logistica/arrivi/viaggi");
            setViaggi(res.data || []);
            setErrore(null);
        } catch (err: any) {
            setErrore(err.message || "Errore sconosciuto");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const today = dayjs().startOf("day");
    const yesterday = dayjs().subtract(1, "day").startOf("day");

    const viaggiRecenti = viaggi.filter((v) => {
        const arrivo = dayjs(v.dataArrivo);
        return arrivo.isSame(today, "day") || arrivo.isSame(yesterday, "day");
    });

    const viaggiAltri = viaggi.filter((v) => {
        const arrivo = dayjs(v.dataArrivo);
        return !arrivo.isSame(today, "day") && !arrivo.isSame(yesterday, "day");
    });

    return (
        <ScrollView className="p-4 bg-white" refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            {loading && <TableUtils.Loading />}
            {errore && <TableUtils.Error>{errore}</TableUtils.Error>}
            {!loading && !errore && viaggi.length === 0 && <TableUtils.NoResult />}
            {!loading && !errore && (
                <>
                    {viaggiRecenti.length > 0 && (
                        <View className="mb-6">
                            <Text className="text-lg font-bold text-center mb-2">Viaggi Recenti</Text>
                            <RenderViaggi lista={viaggiRecenti} />
                        </View>
                    )}
                    {viaggiAltri.length > 0 && (
                        <View>
                            <Text className="text-lg font-bold text-center mb-2">Altri Viaggi</Text>
                            <RenderViaggi lista={viaggiAltri} />
                        </View>
                    )}
                    {viaggiRecenti.length === 0 && viaggiAltri.length === 0 && (
                        <Text className="text-center">Nessun viaggio disponibile.</Text>
                    )}
                </>
            )}
        </ScrollView>
    );
}

type Props = {
    lista: Viaggio[];
};

function RenderViaggi({ lista }: Props) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleExpand = (index: number) => {
        setExpandedIndex(prev => (prev === index ? null : index));
    };

    return (
        <View>
            {lista.map((v, idx) => {
                const expanded = expandedIndex === idx;

                return (
                    <Pressable key={idx} onPress={() => toggleExpand(idx)} className="ps-3 pe-3 py-2 bg-white rounded mb-3 shadow-sm">
                        <View className="flex-row justify-between items-center">
                            <Text className="font-bold">{v.numeroDocumento}</Text>
                            <Text className="text-sm font-semibold">{v.numeroSpedizioniConfermate}/{v.numeroSpedizioniTotali}</Text>
                        </View>

                        <View className="flex-row justify-between mt-1">
                            <Text className="text-sm text-gray-500">{v.descrizione}</Text>
                            <FontAwesome className="my-auto" name={expanded ? "chevron-up" : "chevron-down"} size={10} color="#6b7280" />
                        </View>

                        {expanded && <ListaSpedizioni serial={v.serial} />}
                    </Pressable>
                );
            })}
        </View>
    );
}

function ListaSpedizioni({ serial }: { serial: number }) {
    const [data, setData] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!serial || serial === 0) return;

        setLoading(true);
        setError(null);

        api
            .get(`/api/logistica/arrivi/viaggi/${serial}/spedizioni`)
            .then((response) => {
                setData(response.data);
            })
            .catch((err) => {
                setError(err.message || "Errore durante il caricamento");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [serial]);

    if (loading) return <TableUtils.Loading>Caricamento dei dettagli...</TableUtils.Loading>;
    if (error) return <TableUtils.Error>{error}</TableUtils.Error>;
    if (!data || data.length === 0) return <TableUtils.NoResult>Nessun dettaglio disponibile.</TableUtils.NoResult>;

    return (
        <View className="mt-3 rounded">
            {data.map((item, index) => (
                <>
                    <View key={index} className="ps-1 pe-1 py-1 bg-white rounded mb-3 shadow-sm">
                        <View className="flex-row justify-between items-center">
                            <Text className="font-bold">{item.numeroDocumento}</Text>
                            <Text>{item.numeroColliConfermati} / {item.numeroColliTotali}</Text>
                        </View>
                        <View>
                            <Text><Text className="font-bold">Cliente:</Text> {item.cliente}</Text>
                            <Text><Text className="font-bold">Mittente:</Text> {item.mittente}</Text>
                            <Text><Text className="font-bold">Destinatario:</Text> {item.destinatario}</Text>
                            <Text className="text-sm text-gray-500">{item.pesoComplessivo ?? "N/A"} kg - {item.volumeComplessivo ?? "N/A"} m³</Text>
                        </View>
                    </View>
                </>
            ))}
        </View>
    );
}
