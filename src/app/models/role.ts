
export interface Role {
  idRole?: number;
  nameRole: string;
  descriptionRole: string;
  statusRole: string;
}

export interface RoleCountByStatusDTO {
  status: string;
  quantityRoles: number;
}