import { Mensaje } from '../models/index.js'

//Vamos a checar si esta propiedad tiene ya un mensaje de ese usuario
const mensajePrevio = async (usuarioId, propiedadId) => {
  return Boolean(await Mensaje.findOne({
    where: {
      propiedadId: propiedadId,
      usuarioId: usuarioId
    }
  }));
}

const esVendedor = (usuarioId, propiedadUsuarioId) => {
  return usuarioId === propiedadUsuarioId
}

const formatearFecha = fecha => {
  const fechaLocal = new Date(fecha)

  const opciones = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  // Obtenemos la fecha formateada en español (es-ES)
  const fechaFormateada = fechaLocal.toLocaleDateString('es-ES', opciones);

  // Capitalizamos la primera letra del día de la semana
  return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
}

export {
  esVendedor,
  mensajePrevio,
  formatearFecha
}