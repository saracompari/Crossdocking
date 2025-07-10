import { TableUtils } from "@/app/components/TableUtils";
import api from "@/app/lib/api/api";
import { Trazione } from '@/app/lib/types/trazione';
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";

type ListaTrazioniProps = {
    navigate: (route: string) => void;
};

export default function ListaTrazioni({ navigate }: ListaTrazioniProps) {
    const [trazioni, setTrazione] = useState<Trazione[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setErrore] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(() => {
        setErrore(null);
        return api
            .get<Trazione[]>("/api/logistica/arrivi/trazioni", {
                params: {
                    dallaData: dayjs().format("YYYY-MM-DD"),
                    allaData: dayjs().format("YYYY-MM-DD"),
                },
            })
            .then((res) => {
                setTrazione(res.data || []);
                setErrore(null);
            })
            .catch((err) => {
                setErrore(err.message || "Errore sconosciuto");
            })
            .finally(() => {
                setLoading(false);
                setRefreshing(false);
            });
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    if (loading && !refreshing) {
        return <TableUtils.Loading>Presto verranno caricati i risultati.</TableUtils.Loading>;
    }

    if (error) {
        return <TableUtils.Error>{error}</TableUtils.Error>;
    }

    if (!trazioni || trazioni.length === 0) {
        return <TableUtils.NoResult>Non ci sono risultati.</TableUtils.NoResult>;
    }

    const renderItem = ({ item }: { item: Trazione }) => (
        <Pressable
            onPress={() => navigate("/arrivi/trazione/" + item.serial)}
            className="bg-white p-4 my-1 rounded-lg shadow"
        >
            <View className="flex-row justify-between">
                <View className="flex-1">
                    <Text className="text-lg font-bold">{item.targa}</Text>
                    <Text className="text-gray-600 text-sm">{item.vettore}</Text>
                </View>
                <View className="flex-1 justify-center items-start">
                    <Text className="text-gray-700">
                        {dayjs(item.dataOraArrivo).format("DD/MM/YYYY HH:mm")}
                    </Text>
                </View>
            </View>
        </Pressable>
    );

    return (<>
        {loading && <TableUtils.Loading />}
        {error && <TableUtils.Error>{error}</TableUtils.Error>}
        {!loading && !error && trazioni.length === 0 && <TableUtils.NoResult />}
        <Text className="text-lg font-bold text-center mt-4">Trazioni</Text>
        <FlatList
            data={trazioni}
            keyExtractor={(item) => item.serial.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16 }} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        />
    </>
    );
}
