(function() {

  const lat = document.querySelector('#lat').value || 20.67444163271174;
  const lng = document.querySelector('#lng').value || -103.38739216304566;
  const mapa = L.map('mapa').setView([lat, lng ], 16);
  let marker;

  //Utilizar Provider y Geocoder
  const geocodeService = L.esri.Geocoding.geocodeService();
  

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapa);

  //El pin
  marker = new L.marker([lat, lng], {
    draggable: true,
    autoPan: true
  })
  .addTo(mapa);

  //Detectar el movimiento del PIN
  marker.on('moveend', function(e){  //Genera un evento al soltar el pin
    marker = e.target // Me da la posicion 
    const posicion = marker.getLatLng();  //Guardo la Lat y Lng en posicion
    mapa.panTo(new L.LatLng(posicion.lat, posicion.lng)) //Hago que el mapa se centre en las nuevas coordenadas

    //Obtener la información de la calle al soltar el PIN
    geocodeService.reverse().latlng(posicion, 13).run(function(error, resultado){
      console.log(resultado)
      marker.bindPopup(resultado.address.LongLabel)

      //Llenar los Campos
      document.querySelector('.calle').textContent = resultado?.address?.Address ?? '';
      document.querySelector('#calle').value = resultado?.address?.Address ?? '';
      document.querySelector('#lat').value = resultado?.latlng.lat ?? '';
      document.querySelector('#lng').value = resultado?.latlng.lng ?? '';

    })
  })


})()