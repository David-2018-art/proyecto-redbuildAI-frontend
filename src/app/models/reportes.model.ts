export interface CategoryProductCountDTO {
  idCategory: number;
  nameCategory: string;
  quantityProducts: number;
}

export interface UserCountByRoleDTO {
  idRole: number;
  nameRole: string;
  quantityUsers: number;
}

export interface PublicationCountByStatusDTO {
  status: 'Disponible' | 'Pausada' | 'Finalizada' | 'Cancelada';
  quantityPublications: number;
}

export interface ProductPublicationCountDTO {
  idProduct: number;
  nameProduct: string;
  quantityPublications: number;
}

export interface RoleCountByStatusDTO {
  status: string;
  quantityRoles: number;
}

export interface LocationCountByDepartmentDTO {
  department: string;
  quantityLocations: number;
}

export interface TransactionCountByStatusDTO {
  status: string;
  quantityTransactions: number;
}

export interface ReviewCountByScoreDTO {
  score: number;
  quantityReviews: number;
}

export interface PhotoCountByPublicationDTO {
  idPublication: number;
  titlePublication: string;
  quantityPhotos: number;
}

export interface CompletedTransactionSummaryDTO {
  typeTransaction: 'Venta' | 'Donacion';
  quantityTransactions: number;
  totalAmount: number;
}