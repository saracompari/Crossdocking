export type Spedizione = {
    numeroDocumento: string;
    numeroColliConfermati: number;
    numeroColliTotali: number;
    cliente: string;
    mittente: string;
    destinatario: string;
    pesoComplessivo?: number;
    volumeComplessivo?: number;
};