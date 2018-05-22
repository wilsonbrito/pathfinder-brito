var osm = require('openstreetmap-stream'),
    through = require('through2');

osm.createReadStream( './map.osm')
  .pipe( through.obj( function( data, enc, next ){
    console.log( data.type, data.id, data.lat, data.lon );
    next();
  }));