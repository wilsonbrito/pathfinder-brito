var fs = require('fs');
var parse = require('xml-parser');
fs.readFile('marilia-pequena.osm', 'utf8', function(err, xml){
  var inspect = require('util').inspect;

  var obj = parse(xml);

  //console.log(inspect(obj, { colors: true, depth: Infinity }));

  var cloneAndPluck = function(sourceObject, keys) {
      var newObject = {};
      keys.forEach(function(key) { newObject[key] = sourceObject[key]; });
      return newObject;
  };

  var subset = cloneAndPluck(obj, ["lat", "lon"]);

  console.log(subset);

  //https://stackoverflow.com/questions/17781472/how-to-get-a-subset-of-a-javascript-objects-properties
});
