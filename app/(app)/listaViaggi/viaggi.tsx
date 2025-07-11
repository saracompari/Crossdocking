import { TableUtils } from "@/app/components/TableUtils";
import api from "@/app/lib/api/api";
import { Viaggio } from "@/app/lib/types/viaggio";
import { FontAwesome } from "@expo/vector-icons";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";

type ElementoLista = {
    tipo: "header" | "viaggio";
    titolo?: string;
    viaggio?: Viaggio;
};

export default function Lista() {
    const [viaggi, setViaggi] = useState<Viaggio[]>([]);
    const [loading, setLoading] = useState(true);
    const [errore, setErrore] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedSerial, setExpandedSerial] = useState<number | null>(null);

    const toggleExpand = (serial: number) => {
        setExpandedSerial(prev => (prev === serial ? null : serial));
    };

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

    const elementiLista: ElementoLista[] = [];

    if (viaggiRecenti.length > 0) {
        elementiLista.push({ tipo: "header", titolo: "Viaggi Recenti" });
        viaggiRecenti.forEach((v) => elementiLista.push({ tipo: "viaggio", viaggio: v }));
    }

    if (viaggiAltri.length > 0) {
        elementiLista.push({ tipo: "header", titolo: "Altri Viaggi" });
        viaggiAltri.forEach((v) => elementiLista.push({ tipo: "viaggio", viaggio: v }));
    }

    const renderItem = ({ item }: { item: ElementoLista }) => {
        if (item.tipo === "header") {
            return (
                <Text className="text-lg font-bold text-center mb-2 mt-4">
                    {item.titolo}
                </Text>
            );
        }

        const viaggio = item.viaggio!;
        const expanded = expandedSerial === viaggio.serial;

        return (
            <Pressable
                onPress={() => toggleExpand(viaggio.serial)}
                className="bg-white p-4 my-1 rounded-lg shadow">
                <View className="flex-row justify-between items-center">
                    <Text className="font-bold">{viaggio.numeroDocumento}</Text>
                    <Text className="text-sm font-semibold">
                        {viaggio.numeroSpedizioniConfermate}/{viaggio.numeroSpedizioniTotali}
                    </Text>
                </View>

                <View className="flex-row justify-between mt-1">
                    <Text className="text-sm text-gray-500">{viaggio.descrizione}</Text>
                    <FontAwesome
                        name={expanded ? "chevron-up" : "chevron-down"}
                        size={10}
                        color="#6b7280"
                    />
                </View>

                {expanded && <ListaSpedizioni serial={viaggio.serial} />}
            </Pressable>
        );
    };

    return (
        <>
            {loading && <TableUtils.Loading />}
            {errore && <TableUtils.Error>{errore}</TableUtils.Error>}
            {!loading && !errore && viaggi.length === 0 && <TableUtils.NoResult />}
            {!loading && !errore && (
                <FlatList
                    data={elementiLista}
                    keyExtractor={(item, index) =>
                        item.tipo === "header" ? `header-${index}` : `viaggio-${item.viaggio!.serial}`
                    }
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </>
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
                    <View key={index + item.serial} className="ps-1 pe-1 py-1 bg-white rounded mb-3 shadow-sm">
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

