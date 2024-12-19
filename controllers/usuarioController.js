import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import Usuario from '../models/Usuario.js'
import { generarId, generarJWT } from '../helpers/tokens.js'
import { emailRegistro, emailOlvido } from '../helpers/email.js'

const formularioLogin = (req, res) => {
  res.render('auth/login', {
    pagina: "Iniciar Sesión",
    csrfToken: req.csrfToken(),
  })
}

const autenticar = async (req, res) => {
  // Validación
  await check('email').isEmail().withMessage('El campo debe ser un email').run(req);
  await check('password').notEmpty().withMessage('El Password debe ser capturado').run(req);

  const { email, password } = req.body;

  let resultado = validationResult(req)

  // Verificar que el resultado esté vacio
  if (!resultado.isEmpty()) {
    return res.render('auth/login', {
      pagina: 'Iniciar Sesión',
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      usuario: {
        email
      },
    })
  }

  // Checar si el usuario no existe
  const usuario = await Usuario.findOne({ where: { email } })
  if (!usuario) {
    return res.render('auth/login', {
      pagina: 'Iniciar Sesión',
      csrfToken: req.csrfToken(),
      errores: [{ msg: 'El Usuario no está registrado' }]
    })
  }

  // Checar si el usuario no está confirmado
  if (!usuario.confirmado) {
    return res.render('auth/login', {
      pagina: 'Iniciar Sesión',
      csrfToken: req.csrfToken(),
      errores: [{ msg: 'Tu cuenta no ha sido confirmada. Por favor checa el correo que se te envió' }]
    })
  }

  // Checar si el password del usuario es Incorrecto
  if (!usuario.verificaPassword(password)) {
    return res.render('auth/login', {
      pagina: 'Iniciar Sesión',
      csrfToken: req.csrfToken(),
      errores: [{ msg: 'El Password es incorrecto' }]
    })
  }

  // Atenticar al usuario
  const token = generarJWT({ id: usuario.id, nombre: usuario.nombre })

  console.log(token)

  // Almacenar el token en una cookie
  return res.cookie('_token', token, {
    httpOnly: true,
    secure: false // Cuando se suba a producción debe de ser 'true'
  }).redirect('/mis-propiedades')

}

//Cerrar Sesión

const cerrarSesion = (req, res) => {
return res.clearCookie('_token').status(200).redirect('/auth/login')
}


const formularioRegistro = (req, res) => {
  res.render('auth/registro', {
    pagina: 'Registro de nuevos Usuarios',
    csrfToken: req.csrfToken()
  })
}


const registrar = async (req, res) => {
  // Validación
  await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req);
  await check('email').isEmail().withMessage('El campo debe ser un email').run(req);
  await check('password').isLength({ min: 6 }).withMessage('El Password debe tener mínimo 6 caractéres').run(req);
  await check('repetir_password').custom((value, { req }) => value === req.body.password).withMessage('Los Password no son iguales').run(req);

  let resultado = validationResult(req)

  const { nombre, email, password } = req.body

  // Verificar que el resultado esté vacio
  if (!resultado.isEmpty()) {
    return res.render('auth/registro', {
      pagina: 'Registro de nuevos Usuarios',
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      usuario: {
        nombre,
        email
      },
    })
  }

  // Verificar Usuario duplicado
  const existeUsuario = await Usuario.findOne({
    where: { email }
  })

  if (existeUsuario) {
    return res.render('auth/registro', {
      pagina: 'Registro de nuevos Usuarios',
      csrfToken: req.csrfToken(),
      errores: [{ msg: 'El Usuario ya está registrado' }]
    })
  }

  // Almacenar Usuario
  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    token: generarId()
  })

  // Envía email de confirmación
  emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token
  })

  // Mostrar mensaje de confirmación
  res.render('templates/mensaje', {
    pagina: 'Cuenta creada correctamente',
    mensaje: 'Hemos enviando un emal de confirmación. Presiona en el enlace'
  })

}

//  Función que comprueba una cuenta
const confirmar = async (req, res) => {

  const { token } = req.params

  // Verificamos que el token se encuentre en la base de datos
  const usuario = await Usuario.findOne({ where: { token } })

  if (!usuario) {
    return res.render('auth/confirmar-cuenta', {
      pagina: 'Error al confirmar tu cuenta',
      mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
      error: true
    })
  }

  // Confirmar la cuenta del Usuario
  usuario.token = null;
  usuario.confirmado = true;
  await usuario.save()

  res.render('auth/confirmar-cuenta', {
    pagina: 'Confirmación Exitosa',
    mensaje: 'Tu cuenta ha sido confirmada. Ya puedes iniciar Sesión',
  })

  // console.log( req.params.token )
}

const formularioOlvidePassword = (req, res) => {
  res.render('auth/olvide-password', {
    pagina: 'Recupera tu acceso a Bienes Raices',
    csrfToken: req.csrfToken(),
  })
}

const resetPassword = async (req, res) => {
  // Validación
  await check('email').isEmail().withMessage('El campo debe ser un email').run(req);

  let resultado = validationResult(req)

  const { email } = req.body

  // Verificar que el resultado esté vacio
  if (!resultado.isEmpty()) {
    return res.render('auth/olvide-password', {
      pagina: 'Recupera tu acceso a Bienes Raices',
      csrfToken: req.csrfToken(),
      errores: [{ msg: 'El correo debe tener un formato válido' }]
    })
  }

  // Buscar al usuario
  const usuario = await Usuario.findOne({ where: { email } });

  if (usuario) {
    usuario.token = generarId()
    await usuario.save()

    // Envía email de confirmación
    emailOlvido({
      nombre: usuario.nombre,
      email: usuario.email,
      token: usuario.token
    })
  }

  // Mostrar mensaje de confirmación
  res.render('templates/mensaje', {
    pagina: 'Reset de Password',
    mensaje: 'Si el usuario se encuentra registrado, recibiras un correo con las instrucciones'
  })
}

const comprobarToken = async (req, res) => {
  const { token } = req.params
  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return res.render('auth/confirmar-cuenta', {
      pagina: 'Error al validar tus datos',
      mensaje: 'Hubo un error al validar tu cuenta, intenta de nuevo',
      error: true
    })
  }

  res.render('auth/reset-password', {
    pagina: 'Reset Password',
    csrfToken: req.csrfToken(),
  })
}

const nuevoPassword = async (req, res) => {
  await check('password').isLength({ min: 6 }).withMessage('El Password debe tener mínimo 6 caractéres').run(req);
  await check('repetir_password').custom((value, { req }) => value === req.body.password).withMessage('Los Password no son iguales').run(req);

  let resultado = validationResult(req)

  // Verificar que el resultado esté vacio
  if (!resultado.isEmpty()) {
    return res.render('auth/reset-password', {
      pagina: 'Reset Password',
      csrfToken: req.csrfToken(),
      errores: resultado.array()
    })
  }

  const { password } = req.body
  const { token } = req.params
  const usuario = await Usuario.findOne({ where: { token } });

  // Hashear el nuevo password
  const salt = await bcrypt.genSalt(10);
  usuario.password = await bcrypt.hash(password, salt)
  usuario.token = null;

  await usuario.save()

  res.render('auth/confirmar-cuenta', {
    pagina: 'Password Actualizado',
    mensaje: 'Tu password ha sido actualizado. Ya puedes iniciar Sesión',
  })

}

export {
  formularioLogin,
  autenticar,
  cerrarSesion,
  formularioRegistro,
  registrar,
  formularioOlvidePassword,
  resetPassword,
  comprobarToken,
  nuevoPassword,
  confirmar
}