export interface Category {
  idCategory?: number;
  nameCategory: string;
  descriptionCategory: string;
  statusCategory: 'Activo' | 'Inactivo';
}

export interface CategoryProductCount {
  idCategory: number;
  nameCategory: string;
  quantityProducts: number;
}