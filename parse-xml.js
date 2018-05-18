var fs = require('fs');
var parse = require('xml-parser');
fs.readFile('marilia-pequena.osm', 'utf8', function(err, xml){
  var inspect = require('util').inspect;

  var obj = parse(xml);

  //imprime todos objetos
  //console.log(inspect(obj, { colors: true, depth: Infinity }));

  //descobrir quantos nó irei percorrer
  //console.log(obj.root.children.length)

  for(let i = 0; i <= obj.root.children.length; i++){

    var node = obj.root.children[i];
    if(node && node.name && node.name === 'way'){
      console.log('WAY')
      for(var tags = 0; tags <= node.children.length; tags++){
        var n = node.children[tags];
        
        var quarteiroes = [];
        if(n && n.name && n.name === 'nd'){
          quarteiroes.push(n.attributes.ref);
        };

        if(n && n.name && n.name === 'tag'){
          console.log('rua', n.attributes);
        };
      }
    }
    //console.log(obj.root.children[i].attributes);
  }
});
