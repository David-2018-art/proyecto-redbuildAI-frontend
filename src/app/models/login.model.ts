export interface LoginRequest {
  emailUser: string;
  passwordUser: string;
}

export interface LoginResponse {
  token: string;
  idUser: number;
  nameUser: string;
  emailUser: string;
  role: string;
}
