import multer from 'multer'
import path from 'path'
import { generarId } from '../helpers/tokens.js' //Vamos a importar nuestra función de generar un token Aleatorio para usarlo como nombre de Archivo

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function(req, file, cb) {
    cb(null, generarId() + path.extname(file.originalname))
  }
})

const upload = multer({ storage }) //Definimos el Middleware con los parámetros que guardamos en  "storege"

export default upload