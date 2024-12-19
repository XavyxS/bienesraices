import categorias from './seedCategorias.js';
import precios from './seedPrecios.js'
import usuarios from './seedUsuarios.js'
import propiedades from './seedPropiedades.js'
import db from '../config/db.js'
import { Precio, Categoria, Usuario, Propiedad } from '../models/index.js'
import { where } from 'sequelize';

const importarDatos = async () => {
  try {
    //Autenticar
    await db.authenticate()

    //Genera las Columnas
    await db.sync()

    // Este Promise.all hace que se ejecuten las dos tarreas al mismo tiempo
    await Promise.all([
      //Insertamos los datos de las Categorias
      Categoria.bulkCreate(categorias),
      //Insertamos los datos de los Precios
      Precio.bulkCreate(precios),
      //Insertamos Usuarios del seeder de usuarios
      Usuario.bulkCreate(usuarios)
    ])

    //Insertamos las Propiedades
    await Propiedad.bulkCreate(propiedades)

    console.log('Datos Importados Correctamente')

    process.exit()

  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

const eliminarDatos = async () => {
  try {
    // Autenticar conexión
    await db.authenticate();

    //Otra alternativa de borrar la BD en una sola linea.
    //Lo que hace 'force' es eliminar las tablas y volver a crealas con datos vacios.
    await db.sync({ force: true })

    console.log('Datos Eliminados Correctamente')
    process.exit()

  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

if (process.argv[2] === "-i") {
  importarDatos()
}

if (process.argv[2] === "-e") {
  eliminarDatos()
}