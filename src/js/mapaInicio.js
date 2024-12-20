
(function () {

  const lat = 20.67444163271174;
  const lng = -103.38739216304566;
  const mapa = L.map('mapa-inicio').setView([lat, lng], 16);

  let markers = new L.FeatureGroup().addTo(mapa)

  let propiedades = [];

  //Filtros
  const filtros = {
    categoria: '',
    precio: ''
  }

  const categoriasSelect = document.querySelector('#categorias');
  const preciosSelect = document.querySelector('#precios');

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapa);

  //Filtrado de categorias y precios
  categoriasSelect.addEventListener('change', e => {
    filtros.categoria = +e.target.value
    filtrarPropiedades()
  })

  preciosSelect.addEventListener('change', e => {
    filtros.precio = +e.target.value
    filtrarPropiedades()
  })



  //Obtener los datos de propiedades a través de la API que creamos en 
  const obtenerPropiedades = async () => {
    try {
      const url = '/api/propiedades'
      const respuesta = await fetch(url)
      propiedades = await respuesta.json()

      mostrarPropiedades(propiedades)

    } catch (error) {
      console.log(error)

    }
  }

  const mostrarPropiedades = (propiedades) => {

    // Limpiar los markers previos
    markers.clearLayers()

    propiedades.forEach(propiedad => {
      //Agregar los pines
      const marker = new L.marker([propiedad.lat, propiedad.lng], {
        autoPan: true
      })
        .addTo(mapa)
        .bindPopup(`
          <h1 class="text-md font-extrabold uppercase my-5">${propiedad.titulo}</h1>
          <img src="https://res.cloudinary.com/dld2uhhbc/image/upload/f_auto/${propiedad.imagen}", alt="${propiedad.titulo}">


          <p class="text-gray-600 font-bold">${propiedad.precio.nombre}</p>
          <p class="text-indigo-600 font-bold">${propiedad.categoria.nombre}</p>
          <a href="/propiedad/${propiedad.id}" class="bg-indigo-600 block p-2 text-center uppercase">Ver Propiedad</a>
        `)

      markers.addLayer(marker)
    });

  }

  const filtrarPropiedades = () => {
    const resultado = propiedades.filter(filtrarCategoria).filter(filtrarPrecio)
    console.log(resultado)
    mostrarPropiedades(resultado)
  }

  const filtrarCategoria = propiedad => filtros.categoria ? propiedad.categoriaId === filtros.categoria : propiedad

  const filtrarPrecio = propiedad => filtros.precio ? propiedad.precioId === filtros.precio : propiedad

  obtenerPropiedades()

})()