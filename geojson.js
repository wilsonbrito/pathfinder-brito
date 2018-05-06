var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-22.200215, -49.949711]
    }
};

//desenha as coordinates no mapa
var myLines = [{
  "type": "LineString",
  "coordinates":  [
    [
      -49.94816064834595,
      -22.199226435396206
    ],
    [
      -49.947779774665825,
      -22.199658544958723
    ],
    [
      -49.94814723730087,
      -22.200050919156524
    ],
    [
      -49.94856297969818,
      -22.200281873076722
    ],
    [
      -49.94874268770218,
      -22.200460675850778
    ],
    [
      -49.94892507791519,
      -22.200632028295573
    ],
    [
      -49.948713183403015,
      -22.200887814889292
    ],
    [
      -49.94944542646408,
      -22.201449053743357
    ],
    [
      -49.950193762779236,
      -22.20199290695259
    ],
    [
      -49.95056390762329,
      -22.20154590446906
    ]
  ]
}];

var myStyle = {
  "color": "#ff7800",
  "weight": 5,
  "opacity": 0.65
};

//criando icones para colocar no mapa
var carro = L.icon({
  iconUrl: 'leaflet/images/mini-car.png',
  iconSize:     [23, 21], // tamanho do icone
  iconAnchor:   [23, 21], // ponto onde irá indexar a localização de acordo com a imagem
  popupAnchor:  [-23, -26] // local onde irá subir a popup
});
var emergencia = L.icon({
  iconUrl: 'leaflet/images/emergencia2.png',
  iconSize:     [23, 21], // tamanho do icone
  iconAnchor:   [23, 21], // ponto onde irá indexar a localização de acordo com a imagem
  popupAnchor:  [-23, -21] // local onde irá subir a popup
});

//adiciona o circle de acordo com a localização que for inserida
// var circle = L.circle([-22.199261, -49.948123], {
//     color: 'red',
//     fillColor: '#f03',
//     fillOpacity: 0.5,
//     radius: 10
// }).addTo(mymap);

//Reporta um polygon de acordo com as codernadas
// var polygon = L.polygon([
//   [-22.20016, -49.94844],
//   [-22.200314, -49.948595],
//   [-22.200528, -49.948869],
//   [-22.20086, -49.948751]
// ]).addTo(mymap);
