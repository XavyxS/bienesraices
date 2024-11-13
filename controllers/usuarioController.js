import { check, validationResult } from 'express-validator'
import Usuario from '../models/Usuario.js'

const formularioLogin = (req, res) => {
  res.render('auth/login', {
    pagina: "Iniciar Sesión"
  })
}

const formularioRegistro = (req, res) => {
  res.render('auth/registro', {
    pagina: 'Registro de nuevos Usuarios'
  })
}


const registrar = async (req, res) => {
  // Validación
  await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req);
  await check('email').isEmail().withMessage('El campo debe ser un email').run(req);
  await check('password').isLength({ min: 6 }).withMessage('El Password debe tener mínimo 6 caractéres').run(req);
  await check('repetir_password').equals('password').withMessage('Los Password no son iguales').run(req);

  let resultado = validationResult(req)

  const { nombre, email, password } = req.body

  // Verificar que el resultado esté vacio
  if (!resultado.isEmpty()) {
    return res.render('auth/registro', {
      pagina: 'Registro de nuevos Usuarios',
      errores: resultado.array(),
      usuario: {
        nombre,
        email
      }
    })
  }

  // Verificar Usuario duplicado
  const existeUsuario = await Usuario.findOne({
    where: { email }
  })

  if ( existeUsuario){
    return res.render('auth/registro', {
      pagina: 'Registro de nuevos Usuarios',
      errores: [ {msg: 'El Usuario ya está registrado'} ]
    })
  }

  const usuario = await Usuario.create(req.body)
  res.json(usuario)
}

const formularioOlvidePassword = (req, res) => {
  res.render('auth/olvide-password', {
    pagina: 'Recupera tu acceso a Bienes Raices'
  })
}

export {
  formularioLogin,
  formularioRegistro,
  formularioOlvidePassword,
  registrar
}