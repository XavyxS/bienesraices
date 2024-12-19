import { unlink } from 'node:fs/promises'
import { validationResult } from 'express-validator'
import { Precio, Categoria, Propiedad, Mensaje, Usuario } from '../models/index.js'
import { esVendedor, mensajePrevio, formatearFecha } from '../helpers/indexHelper.js'

const admin = async (req, res) => {

  //Leer el QueryString

  const { pagina: paginaActual } = req.query
  const expresion = /^(?!0$)\d+$/  //Esta expresión regular garantiza que sólo haya numeros en el query de 'pagina' y que no sea un cero

  if (!expresion.test(paginaActual)) {
    return res.redirect('/mis-propiedades?pagina=1')
  }

  try {

    const { id } = req.usuario

    //Límites y offset para la paginación

    const limit = 7
    const offset = (limit * paginaActual) - limit

    const [propiedades, totalPropiedades] = await Promise.all([
      Propiedad.findAll({
        limit,
        offset,
        where: {
          usuarioId: id
        },
        include: [
          { model: Categoria, as: 'categoria' },
          { model: Precio, as: 'precio' },
          { model: Mensaje, as: 'mensajes' }
        ]
      }),
      Propiedad.count({
        where: {
          usuarioId: id
        }
      })

    ])

    console.log(totalPropiedades)

    res.render('propiedades/admin', {
      pagina: 'Mis Propiedades',
      csrfToken: req.csrfToken(),
      propiedades,
      paginas: Math.ceil(totalPropiedades / limit),
      paginaActual: Number(paginaActual),
      totalPropiedades,
      offset,
      limit
    })

  } catch (error) {
    console.log(error)
  }


}

//Formulario para crear una nueva Propiedad
const crear = async (req, res) => {

  //Consultar modelo de Categoria y Precio
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll()
  ]);

  res.render('propiedades/crear', {
    pagina: 'Crear Propiedad',
    csrfToken: req.csrfToken(),
    categorias,
    precios,
    datos: {}
  })
}

const guardar = async (req, res) => {

  //Validación
  let resultado = validationResult(req)

  // Verificar que el resultado de errores  no esté vacio
  if (!resultado.isEmpty()) {

    //Consultar modelo de Categoria y Precio
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll()
    ]);

    return res.render('propiedades/crear', {
      pagina: 'Crear Propiedad',
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      categorias,
      precios,
      datos: req.body,
    })
  }

  // Crear un registro
  const { titulo, descripcion, categoria: categoriaId, precio: precioId, habitaciones, estacionamiento, wc, calle, lat, lng } = req.body

  const { id: usuarioId } = req.usuario

  try {
    const propiedadGuardada = await Propiedad.create({
      titulo,
      descripcion,
      categoriaId,
      precioId,
      habitaciones,
      estacionamiento,
      wc,
      calle,
      lat,
      lng,
      usuarioId,
      imagen: ''
    })

    const { id } = propiedadGuardada

    res.redirect(`/propiedades/agregar-imagen/${id}`)

  } catch (error) {
    console.log(error)
  }

}

const agregarImagen = async (req, res) => {

  const { id } = req.params;

  //Verificar que la Propiedada exista
  const propiedad = await Propiedad.findByPk(id)

  //Checar si NO existe la propiedad
  if (!propiedad) {
    res.redirect('/mis-propiedades')
  }

  //Verificar que la Propiedad no esté publicada
  if (propiedad.publicado) {
    res.redirect('/mis-propiedades')
  }

  //Verificar que la Propiedad pertence al Usuario Activo
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    res.redirect('/mis-propiedades')
  }


  res.render('propiedades/agregar-imagen', {
    pagina: `Agregar Imagen: ${propiedad.titulo}`,
    csrfToken: req.csrfToken(),
    propiedad
  })
}

const almacenarImagen = async (req, res, next) => {

  const { id } = req.params;

  //Verificar que la Propiedada exista
  const propiedad = await Propiedad.findByPk(id)

  //Checar si NO existe la propiedad
  if (!propiedad) {
    res.redirect('/mis-propiedades')
  }

  //Verificar que la Propiedad no esté publicada
  if (propiedad.publicado) {
    res.redirect('/mis-propiedades')
  }

  //Verificar que la Propiedad pertence al Usuario Activo
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    res.redirect('/mis-propiedades')
  }

  try {

    propiedad.imagen = req.file.filename
    propiedad.publicado = 1

    await propiedad.save()

    next()

  } catch (error) {
    console.log(error)
  }

}

const editar = async (req, res) => {

  const { id } = req.params

  //Validar que la propiedad no exista
  const propiedad = await Propiedad.findByPk(id)

  if (!propiedad) {
    return res.redirect('/mis-propiedades')
  }

  //Revisar que quien visita la URL es el usuario al que pertenece la propiedad
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    res.redirect('/mis-propiedades')
  }

  //Consultar modelo de Categoria y Precio
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll()
  ]);

  res.render('propiedades/editar', {
    pagina: 'Editar Propiedad',
    csrfToken: req.csrfToken(),
    categorias,
    precios,
    datos: propiedad
  })
}

const guardarCambios = async (req, res) => {

  console.log('Guardar Cambios')

  //Validación
  let resultado = validationResult(req)

  // Verificar que el resultado de errores  no esté vacio
  if (!resultado.isEmpty()) {

    //Consultar modelo de Categoria y Precio
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll()
    ]);

    return res.render('propiedades/editar', {
      pagina: 'Editar Propiedad',
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      categorias,
      precios,
      datos: req.body,
    })
  }

  const { id } = req.params

  //Validar que la propiedad no exista
  const propiedad = await Propiedad.findByPk(id)

  if (!propiedad) {
    return res.redirect('/mis-propiedades')
  }

  //Revisar que quien visita la URL es el usuario al que pertenece la propiedad
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    res.redirect('/mis-propiedades')
  }

  // Reescribir el Objeto y Actualizarlo
  try {

    // Crear un registro
    const { titulo, descripcion, categoria: categoriaId, precio: precioId, habitaciones, estacionamiento, wc, calle, lat, lng } = req.body

    propiedad.set({
      titulo,
      descripcion,
      categoriaId,
      precioId,
      habitaciones,
      estacionamiento,
      wc,
      calle,
      lat,
      lng,
    })

    await propiedad.save()

    res.redirect("/mis-propiedades")

  } catch (error) {
    console.log(error)
  }

}

const eliminar = async (req, res) => {

  const { id } = req.params

  //Validar que la propiedad no exista
  const propiedad = await Propiedad.findByPk(id)

  if (!propiedad) {
    return res.redirect('/mis-propiedades')
  }

  //Revisar que quien visita la URL es el usuario al que pertenece la propiedad
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    res.redirect('/mis-propiedades')
  }

  //Eliminar la imagen
  await unlink(`public/uploads/${propiedad.imagen}`)

  //Eliminar el registro en la BD
  await propiedad.destroy()
  res.redirect('/mis-propiedades')

}

//Modifica el Estado de la Propiedad
const cambiarEstado = async (req, res) => {

  const { id } = req.params

  //Validar que la propiedad no exista
  const propiedad = await Propiedad.findByPk(id)

  if (!propiedad) {
    return res.redirect('/mis-propiedades')
  }

  //Revisar que quien visita la URL es el usuario al que pertenece la propiedad
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    res.redirect('/mis-propiedades')
  }

  propiedad.publicado = !propiedad.publicado
  await propiedad.save();

  // Responder al cliente con el nuevo estado
  res.status(200).json({
    resultado: 'Estado cambiado con éxito',
    publicado: propiedad.publicado
  });

}


//Area Publica
const mostrarPropiedad = async (req, res) => {

  const { id } = req.params


  //Verificar que la propiedad exista en la BD
  const propiedad = await Propiedad.findByPk(id, {
    include: [
      { model: Categoria, as: 'categoria' },
      { model: Precio, as: 'precio' }
    ]
  })

  //Checar si no se encontró
  if (!propiedad || !propiedad.publicado) {
    return res.redirect('/404')
  }
  let hayMensaje = false
  if (req.usuario) {
    hayMensaje = await mensajePrevio(req.usuario?.id, propiedad.id)
  }

  res.render('propiedades/mostrar', {
    pagina: propiedad.titulo,
    csrfToken: req.csrfToken(),
    propiedad,
    usuario: req.usuario,
    esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
    mensajePrevio: hayMensaje
  })
}

const enviarMensaje = async (req, res) => {
  const { id } = req.params

  //Verificar que la propiedad exista en la BD
  const propiedad = await Propiedad.findByPk(id, {
    include: [
      { model: Categoria, as: 'categoria' },
      { model: Precio, as: 'precio' }
    ]
  })

  //Checar si no se encontró
  if (!propiedad) {
    return res.redirect('/404')
  }

  //Renderizar los errores
  //Validación
  let resultado = validationResult(req)

  //Verifica si hay mensajes precios de este usuario en esa propiedad
  let hayMensaje = false
  if (req.usuario) {
    hayMensaje = await mensajePrevio(req.usuario?.id, propiedad.id)
  }

  // Verificar que el resultado de errores  no esté vacio
  if (!resultado.isEmpty() || hayMensaje) {
    return res.render('propiedades/mostrar', {
      pagina: propiedad.titulo,
      csrfToken: req.csrfToken(),
      propiedad,
      usuario: req.usuario,
      esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
      mensajePrevio: hayMensaje,
      errores: resultado.array()
    })
  }

  const { mensaje } = req.body
  const { id: propiedadId } = req.params
  const { id: usuarioId } = req.usuario

  //Almacenar el mensaje
  await Mensaje.create({
    mensaje,
    propiedadId,
    usuarioId
  })


  res.render('propiedades/mostrar', {
    pagina: propiedad.titulo,
    csrfToken: req.csrfToken(),
    propiedad,
    usuario: req.usuario,
    esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
    mensajePrevio: hayMensaje,
    enviado: true
  })

}

//Leer mensajes Recibidos

const verMensajes = async (req, res) => {

  const { id } = req.params

  //Validar que la propiedad no exista
  const propiedad = await Propiedad.findByPk(id, {
    include: [
      {
        model: Mensaje, as: 'mensajes',
        include: [
          { model: Usuario.scope('eliminarPassword'), as: 'usuario' }
        ]
      }
    ]
  })

  if (!propiedad) {
    return res.redirect('/mis-propiedades')
  }

  //Revisar que quien visita la URL es el usuario al que pertenece la propiedad
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    res.redirect('/mis-propiedades')
  }

  res.render('propiedades/mensajes', {
    pagina: 'Mensajes',
    mensajes: propiedad.mensajes,
    formatearFecha
  })
}


export {
  admin,
  crear,
  guardar,
  agregarImagen,
  almacenarImagen,
  editar,
  guardarCambios,
  eliminar,
  cambiarEstado,
  mostrarPropiedad,
  enviarMensaje,
  verMensajes
}