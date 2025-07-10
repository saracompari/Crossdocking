import { Viaggio } from "./viaggio";

export type Trazione = {
    serial: number;
    targa: string;
    vettore: string;
    sigillo1: string,
    sigillo2: string,
    autista: string,
    dataOraArrivo: Date,
    viaggiAssociati: Viaggio[],
    note: string,
};

export type TrazioneForm = Omit<Trazione, 'serial'>;



