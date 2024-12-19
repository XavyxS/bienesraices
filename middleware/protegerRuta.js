import jwt from 'jsonwebtoken'
import { Usuario } from '../models/index.js'

const protegerRuta = async (req, res, next) => {

  //Verificar si hay un token
  const { _token } = req.cookies
  if (!_token) {
    return res.redirect('/auth/login')
  }
  // Comprobar el token en la BD
  try {
    const decoded = jwt.verify(_token, process.env.JWT_SECRET)
    const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id)  //El scope 'eliminar PAssword' lo definimos en el modelo y lo usamos para que la consulta no se traiga el Pass y otro datos que no son necesarios.

    //Almacenar el Usuario en el Req
    if (usuario) {
      req.usuario = usuario
    } else {
      return res.redirect('/auth/login')
    }
    return next()
    
  } catch (error) {
    return res.clearCookie('_token').redirect('/auth/login')
  }

  next();

}

export default protegerRuta;