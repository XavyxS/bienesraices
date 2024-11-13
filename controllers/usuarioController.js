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