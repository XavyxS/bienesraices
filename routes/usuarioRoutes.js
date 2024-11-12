import express from "express";
import { formularioLogin, formularioRegistro } from '../controllers/usuarioController.js'

const router = express.Router();

router.get('/login', formularioLogin)
router.get('/registro', formularioRegistro)

router.get('/nosotros', (req, res) => {
  res.send('Nosotros son los mejores!')
})

export default router;