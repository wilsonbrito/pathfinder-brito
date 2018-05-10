var fs = require('fs');
var parse = require('xml-parser');
fs.readFile('map.osm', 'utf8', function(err, xml){
  var inspect = require('util').inspect;

  var obj = parse(xml);

  //imprime todos objetos
  //console.log(inspect(obj, { colors: true, depth: Infinity }));

  //descobrir quantos nó irei percorrer
  //console.log(obj.root.children.length)

  for(let i = 0; i <= obj.root.children.length; i++){
  //   // g.addnod(
  //   //   obj,name,
  //   //   obj,numero
  //   // )
  //   // }
  
    console.log(obj.root.children[i].attributes);
  }
  // var cloneAndPluck = function(sourceObject, keys) {
  //     var newObject = {};
  //     keys.forEach(function(key) { newObject[key] = sourceObject[key]; });
  //     return newObject;
  // };
  //
  // var subset = cloneAndPluck(obj, ["lat", "lon"]);
  //
  // console.log(subset);
  //
  // //https://stackoverflow.com/questions/17781472/how-to-get-a-subset-of-a-javascript-objects-properties
});
