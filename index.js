import express from "express";
import usuarioRoutes from "./routes/usuarioRoutes.js"
import path from 'path';
import db from './config/db.js'

const app = express()
const port = 3000;

// Conexión a la Base de Datos
try {
  await db.authenticate();
  console.log('Conexión exitosa a la BD')
} catch (error) {
  console.log('error en la conexión')
}

// Habilitar PUG
app.set('view engine', 'pug')
app.set('views', './views')

// Carpeta pública
app.use(express.static(path.resolve('public')));
// app.set( express.static('public'))

//Routing
app.use('/auth', usuarioRoutes);

// Inicia el servidor en el puerto especificado.
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});