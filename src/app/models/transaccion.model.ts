export interface Transaccion {
  idTransaccion?: number;
  typeTransaction: 'Venta' | 'Donacion';
  quantityTransaction: number;
  agreedUnitPrice: number;
  amountTransaction?: number;
  descriptionTransaction?: string;
  dateRegisterTransaction?: string;
  reservationDate?: string;
  closingDate?: string;
  statusTransaction: 'Solicitada' | 'Reservada' | 'Completada' | 'Cancelada' | 'Rechazada';
  idPublication: number;
  idUser: number;
  nameUser?: string;
  emailUser?: string;
}
