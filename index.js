import express from "express";
import csurf from "csurf";
import cookieParser from "cookie-parser";
import usuarioRoutes from "./routes/usuarioRoutes.js"
import propiedadesRoutes from "./routes/propiedadesRoutes.js"
import appRoutes from "./routes/appRoutes.js"
import apiRoutes from "./routes/apiRoutes.js"
import path from 'path';
import db from './config/db.js'

const app = express()
const port = process.env.PORT || 3000;

// Habilitar lectura de datos desde formularios
app.use( express.urlencoded({extended: true}) )

// Habilitar cookie-parser
app.use( cookieParser(process.env.COOKIE_PASS) )

// Habilitar el CSRF
app.use( csurf({cookie: true}) )

// Conexión a la Base de Datos
try {
  await db.authenticate();
  db.sync()
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
app.use('/', propiedadesRoutes);
app.use('/', appRoutes);
app.use('/api', apiRoutes);

// Inicia el servidor en el puerto especificado.
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});