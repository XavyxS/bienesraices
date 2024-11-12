import express from "express";
import usuarioRoutes from "./routes/usuarioRoutes.js"

const app = express()
const port = 3000;

// Habilitar PUG
app.set('view engine', 'pug')
app.set('views', './views')

// Carpeta pública
app.set( express.static('public'))

//Routing
app.use('/auth', usuarioRoutes);

// Inicia el servidor en el puerto especificado.
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});