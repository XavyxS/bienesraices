import { body } from 'express-validator'
import express from 'express'
import { admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, eliminar, cambiarEstado, mostrarPropiedad, enviarMensaje, verMensajes } from '../controllers/propiedadController.js'
import protegerRuta from '../middleware/protegerRuta.js'
import upload from '../middleware/subirImagen.js'
import identificarUsuario from '../middleware/identificarUsuario.js'

const router = express.Router()

router.get('/mis-propiedades', protegerRuta, admin)
router.get('/propiedades/crear', protegerRuta, crear)
router.post('/propiedades/crear', protegerRuta,
  body('titulo').notEmpty().withMessage('El Título de la Propiedad es Obligatorio'),
  body('descripcion')
    .notEmpty().withMessage('La Descripción no puede ir vacía')
    .isLength({ max: 200 }).withMessage('La Descripción es muy larga'),
  body('categoria').isNumeric().withMessage('Selecciona una Categoría'),
  body('precio').isNumeric().withMessage('Selecciona un Rango de Precio'),
  body('habitaciones').isNumeric().withMessage('Selecciona el número de Habitaciones'),
  body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de Estacionamientos'),
  body('wc').isNumeric().withMessage('Selecciona el número de baños'),
  body('lat').notEmpty().withMessage('Ubica la Propiedad en el Mapa'),
  guardar
)
router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagen)

router.post('/propiedades/agregar-imagen/:id', protegerRuta, upload.single('imagen'), almacenarImagen)

router.get('/propiedades/editar/:id', protegerRuta, editar)

router.post('/propiedades/editar/:id', protegerRuta,
  body('titulo').notEmpty().withMessage('El Título de la Propiedad es Obligatorio'),
  body('descripcion')
    .notEmpty().withMessage('La Descripción no puede ir vacía')
    .isLength({ max: 200 }).withMessage('La Descripción es muy larga'),
  body('categoria').isNumeric().withMessage('Selecciona una Categoría'),
  body('precio').isNumeric().withMessage('Selecciona un Rango de Precio'),
  body('habitaciones').isNumeric().withMessage('Selecciona el número de Habitaciones'),
  body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de Estacionamientos'),
  body('wc').isNumeric().withMessage('Selecciona el número de baños'),
  body('lat').notEmpty().withMessage('Ubica la Propiedad en el Mapa'),
  guardarCambios
)

router.post('/propiedades/eliminar/:id', protegerRuta, eliminar)
router.put('/propiedades/:id', protegerRuta, cambiarEstado)

//Área Pública

router.get('/propiedad/:id', identificarUsuario, mostrarPropiedad)

router.post('/propiedad/:id', identificarUsuario,
  body('mensaje').isLength({ min: 10 }).withMessage('El mensaje no puede ir vacio o es muy corto'),
  enviarMensaje)

router.get('/mensajes/:id', protegerRuta, verMensajes)

export default router