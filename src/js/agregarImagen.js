import { Dropzone } from 'dropzone';

const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

Dropzone.options.imagen = {
  dictDefaultMessage: 'Sube tus imágnes aquí...',
  acceptedFiles: '.jpg,.png,.jpeg,.gif',
  maxFilesize: 5,
  maxFiles: 1,
  parallelUploads: 1,
  autoProcessQueue: false,
  addRemoveLinks: true,
  dictRemoveFile: 'Borrar Archivo',
  dictMaxFilesExceeded: 'El límite es 1 Archivo...',
  headers: {
    'CSRF-Token': token
  },
  paramName: 'imagen',
  init: function () {
    // Obtener el objeto Dropzone
    const myDropzone = this;

    // Evento para el botón "publicar"
    document.querySelector('#publicar').addEventListener('click', function (e) {
      e.preventDefault()  // Evita que el formulario se envíe automáticamente

      // Procesar la cola de archivos
      myDropzone.processQueue()
    })

    //Checa que todas las imágnes se hayn subido y después direcciona a 'mis-propiedades'
    myDropzone.on('queuecomplete', function () {
      if (myDropzone.getActiveFiles().length == 0) {
        window.location.href = '/mis-propiedades'
      }
  })
}
}
