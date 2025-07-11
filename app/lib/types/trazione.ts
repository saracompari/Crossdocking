import { Viaggio } from "./viaggio";

export type Trazione = {
    serial?: number;
    targa: string;
    vettore: string;
    sigillo1: string,
    sigillo2: string,
    autista: string,
    dataOraArrivo: Date,
    viaggi: Viaggio[],
    note: string,
    tsConferma?: string | null;
    userConferma?: string | null;
    userInsert?: string;
    dataInsert?: string;
    userPost?: string | null;
    dataPost?: string | null;
};




