import { FontAwesome } from "@expo/vector-icons";
import { Text, View } from "react-native";

type TableUtilsMessageProps = {
    titolo?: string;
    icon?: keyof typeof FontAwesome.glyphMap;
    spin?: boolean;
    small?: boolean;
    children?: React.ReactNode;
    iconSize?: number;
};

export default function TableUtilsMessage({
    titolo,
    icon,
    spin = false,
    small = false,
    iconSize = small ? 16 : 24,
    children,
}: TableUtilsMessageProps) {
    if (small) {
        return (
            <View className="flex-row items-center space-x-3 text-gray-500">
                {icon && <FontAwesome name={icon} size={iconSize} />}
                <View>
                    {titolo && <Text className="font-bold text-sm">{titolo}</Text>}
                    <Text className="text-xs text-gray-500">{children}</Text>
                </View>
            </View>
        );
    }

    return (
        <View className="bg-white rounded-xl shadow p-6 items-center space-y-3">
            {icon && <FontAwesome name={icon} size={iconSize} />}
            {titolo && <Text className="font-bold text-base text-center">{titolo}</Text>}
            <Text className="text-sm text-gray-500 text-center">{children}</Text>
        </View>
    );
}

export function TableUtilsLoading({
    children = "Presto verranno caricati i dati",
    ...props
}: Omit<TableUtilsMessageProps, "titolo" | "icon">) {
    return (
        <TableUtilsMessage
            titolo="Caricamento in corso..."
            icon="spinner"
            {...props}
        >
            {children}
        </TableUtilsMessage>
    );
}

export function TableUtilsError({
    children = "Errore durante il caricamento",
    ...props
}: Omit<TableUtilsMessageProps, "titolo" | "icon">) {
    return (
        <TableUtilsMessage
            titolo="Oh no... c'è un problema."
            icon="frown-o"
            {...props}
        >
            {children}
        </TableUtilsMessage>
    );
}

export function TableUtilsNoResult({
    children = "Nessun risultato trovato",
    message = "Prova ad utilizzare altri filtri",
    beSad = true,
    ...props
}: {
    children?: React.ReactNode;
    message?: React.ReactNode;
    beSad?: boolean;
} & Omit<TableUtilsMessageProps, "titolo" | "icon">) {
    return (
        <TableUtilsMessage
            titolo={typeof children === "string" ? children : "Nessun risultato trovato"}
            icon={beSad ? "frown-o" : "times-circle"}
            {...props}
        >
            {message}
        </TableUtilsMessage>
    );
}

export const TableUtils = {
    Message: TableUtilsMessage,
    Loading: TableUtilsLoading,
    Error: TableUtilsError,
    NoResult: TableUtilsNoResult,
};
