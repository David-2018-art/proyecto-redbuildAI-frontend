export interface Resena {
  idResena?: number;
  titleResena: string;
  descriptionResena?: string;
  scoreResena: number;
  dateRegisterResena?: string;
  statusResena: boolean;
  idUser: number;
  idRatedUser: number;
  idTransaccion: number;
}
