import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const { nombre, email, token} = datos

  // Enviar el email
  await transport.sendMail({
    from: 'Bienes Raices',
    to: email,
    subject: 'Confirma tu Cuenta en Bienes Raices',
    text: 'Confirma tu Cuenta en Bienes Raices',
    html: `
      <p>Hola, ${nombre}, comprueba tu correo en BienesRaices.com</p>

      <p>Tu cuenta ya está lista, sólo debes confirmarla en el siguiente enlace:
      <a href="${ process.env.BACKEND_URL }:${ process.env.PORT  ?? 3000 }/auth/confirmar/${ token }">Confirmar cuenta</a></p>

      <p>Si no creaste esta cuenta, puedes ignorar el mensaje</p> 
    `
  })

}

const emailOlvido = async (datos) => {
  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const { nombre, email, token} = datos

  // Enviar el email
  await transport.sendMail({
    from: 'Bienes Raices',
    to: email,
    subject: 'Restablece tu password en Bienes Raices',
    text: 'Restablece tu password en Bienes Raices',
    html: `
      <p>Hola, ${nombre}, restable tu password en BienesRaices.com</p>

      <p>Si deseas restablecesr tu password, haz click en el siguiente enlace:
      <a href="${ process.env.BACKEND_URL }:${ process.env.PORT  ?? 3000 }/auth/olvide-password/${ token }">Restablecer Password</a></p>

      <p>Si no solicitaste el reseteo de tu password, puedes ignorar el mensaje</p> 
    `
  })


}

export {
  emailRegistro,
  emailOlvido
}