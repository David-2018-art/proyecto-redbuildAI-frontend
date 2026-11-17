export interface Publication {
  id: number;
  title: string;
  observations?: string;
  operationType: 'Venta' | 'Donacion';
  publicationDate?: string;
  status: 'Disponible' | 'Pausada' | 'Finalizada' | 'Cancelada';
  productId: number;
  locationId: number;
  publisherUserId: number;
}
