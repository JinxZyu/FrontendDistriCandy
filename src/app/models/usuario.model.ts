export enum TipoUsuario {
  ADMIN = 1,
  USUARIO = 2
}

export interface Usuario {
  id_usuario: number;
  correo: string;
  nombre_completo: string;
  tipo_usuario: number;
  esAdmin?: boolean;
}

export interface CredencialesLogin {
  correo: string;
  clave: string;
}

export interface RespuestaLogin {
  exito: boolean;
  isAdmin?: boolean; 
  mensaje?: string;
  usuario?: Usuario;
  error?: string;
  bloqueado?: boolean;  
}