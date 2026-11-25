export interface Product {
  idProduct?: number;
  nameProduct: string;
  descriptionProduct: string;
  material: string;
  colour: string;
  statusMaterial: 'Nuevo' | 'Como nuevo' | 'Bueno' | 'Regular';
  quantityProduct: number;
  unidadMedidaProduct: string;
  priceProduct: number;
  dateRegisterProduct?: string;
  statusProduct: 'Activo' | 'Inactivo';
  idCategory: number;
  idUser: number;
  nombrePropietario?: string;
}