import jwt from 'jsonwebtoken'
import { Usuario } from '../models/index.js'

const identificarUsuario = async (req, res, next) => {
  //Identificar si hay un token en las cookies  
  const { _token } = req.cookies
  
  if (!_token) {
    req.usuario = null
    return next()
  }

  //Comprobar el Token
  try {
    const decoded = jwt.verify(_token, process.env.JWT_SECRET)
    const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id)  //El scope 'eliminar PAssword' lo definimos en el modelo y lo usamos para que la consulta no se traiga el Pass y otro datos que no son necesarios.

    if (usuario) {
      req.usuario = usuario
    }
    return next()

  } catch (error) {
    console.log(error)
    return res.clearCookie('_token').redirect('/auth/login')
  }
}

export default identificarUsuario