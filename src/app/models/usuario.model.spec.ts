import { Usuario, TipoUsuario } from './usuario.model';

describe('Usuario model', () => {
  it('should create a valid Usuario object', () => {
    const usuario: Usuario = {
      id_usuario: 1,
      correo: 'test@example.com',
      nombre_completo: 'Usuario Test',
      tipo_usuario: TipoUsuario.ADMIN
    };

    expect(usuario).toBeTruthy();
    expect(usuario.tipo_usuario).toBe(TipoUsuario.ADMIN);
  });
});