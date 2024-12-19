
import { Precio, Categoria, Propiedad } from '../models/index.js'
import { Sequelize } from 'sequelize'

const inicio = async (req, res) => {

  const [categorias, precios, casas, departamentos] = await Promise.all([
    Categoria.findAll({ raw: true }),
    Precio.findAll({ raw: true }),
    Propiedad.findAll({
      limit: 3,
      where: {
        categoriaId: 1
      },
      include: [
        {
          model: Precio,
          as: 'precio'
        }
      ],
      order: [
        ['createdAt', 'DESC']
      ]
    }),
    Propiedad.findAll({
      limit: 3,
      where: {
        categoriaId: 2
      },
      include: [
        {
          model: Precio,
          as: 'precio'
        }
      ],
      order: [
        ['createdAt', 'DESC']
      ]
    })

  ])

  console.log(precios)

  res.render('inicio', {
    pagina: 'Inicio',
    csrfToken: req.csrfToken(),
    categorias,
    precios,
    casas,
    departamentos
  })

}

const categoria = async (req, res) => {

  const { id } = req.params

  // Checar que la categoría existe

  const categoria = await Categoria.findByPk(id)
  if (!categoria) {
    return res.redirect('/404')
  }


  //Leer el QueryString para la paginación

  const { pagina: paginaActual } = req.query
  const expresion = /^(?!0$)\d+$/  //Esta expresión regular garantiza que sólo haya numeros en el query de 'pagina' y que no sea un cero

  if (!expresion.test(paginaActual)) {
    return res.redirect(`/categoria/${id}?pagina=1`)
  }


  try {


    const limit = 6
    const offset = (limit * paginaActual) - limit

    const [propiedades, totalPropiedades] = await Promise.all([
      Propiedad.findAll({
        limit,
        offset,
        where: {
          categoriaId: id
        },
        include: [
          { model: Categoria, as: 'categoria' },
          { model: Precio, as: 'precio' }
        ]
      }),
      Propiedad.count({
        where: {
          categoriaId: id
        }
      })

    ])

    res.render('categorias', {
      pagina: `${categoria.nombre}s en Venta`,
      csrfToken: req.csrfToken(),
      propiedades,
      paginas: Math.ceil(totalPropiedades / limit),
      paginaActual: Number(paginaActual),
      totalPropiedades,
      offset,
      limit,
      id
    })


  } catch (error) {
    console.log(error)

  }

}

const noEncontrado = (req, res) => {

  res.render('404', {
    pagina: 'No Encontrada',
    csrfToken: req.csrfToken()
  })

}

const buscador = async (req, res) => {

  const { termino } = req.query

  if (!termino) {
    return res.redirect('back')
  }

  console.log(termino)
  //Leer el QueryString para la paginación

  const { pagina: paginaActual } = req.query
  const expresion = /^(?!0$)\d+$/  //Esta expresión regular garantiza que sólo haya numeros en el query de 'pagina' y que no sea un cero

  if (!expresion.test(paginaActual)) {
    return res.redirect(`/buscador/?termino=${termino}&pagina=1`)
  }

  try {
    const limit = 6
    const offset = (limit * paginaActual) - limit

    const [propiedades, totalPropiedades] = await Promise.all([
      Propiedad.findAll({
        limit,
        offset,
        where: {
          titulo: {
            [Sequelize.Op.like]: '%' + termino + '%'
          }
        },
        include: [
          { model: Precio, as: 'precio' }
        ]
      }),
      Propiedad.count({
        where: {
          titulo: {
            [Sequelize.Op.like]: '%' + termino + '%'
          }
        }
      })
    ])


    res.render('busqueda', {
      pagina: 'Resultados de la Búsqueda',
      // csrfToken: req.csrfToken(),
      propiedades,
      paginas: Math.ceil(totalPropiedades / limit),
      paginaActual: Number(paginaActual),
      totalPropiedades,
      offset,
      limit,
      termino
    })

  } catch (error) {
    console.log(error)
  }

}



export {
  inicio,
  categoria,
  noEncontrado,
  buscador
}
