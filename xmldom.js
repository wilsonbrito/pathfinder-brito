// var DOMParser = require('xmldom').DOMParser;
// var doc = new DOMParser().parseFromString(
//     '<?xml version="1.0" encoding="UTF-8"?>\n'+
//         '\t<child>test</child\n'+
//         '\t<child></child>\n'+
//         '\t<child/>\n'+
//     '</xml>'
//     ,'text/xml');
// doc.documentElement.setAttribute('x','y');
// doc.documentElement.setAttributeNS('./lite','c:x','y2');
// var nsAttr = doc.documentElement.getAttributeNS('./lite','x')
// console.info(nsAttr)
// console.info(doc)
var fs = require('fs');
var DomParser = require('xml-parser');
fs.readFile('marilia-pequena.osm', 'utf8', function(err, xml){
  var parser = new DomParser();
  var doc = parser.parseFromString(xml, "application/xml");
  console.log(doc);
});
