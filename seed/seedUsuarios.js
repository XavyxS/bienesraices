import bcrypt from 'bcrypt'

const usuarios = [
  {
    nombre: 'Javier Sandoval',
    email: 'javier@correo.com',
    password: bcrypt.hashSync('12345678', 10),
    confirmado: 1
  },
  {
    nombre: 'Pedro Ramirez',
    email: 'pedro@correo.com',
    password: bcrypt.hashSync('12345678', 10),  
    confirmado: 1
  },
  {
    nombre: 'Maria Díaz',
    email: 'maria@correo.com',
    password: bcrypt.hashSync('12345678', 10),  
    confirmado: 1
  }
]

export default usuarios;
