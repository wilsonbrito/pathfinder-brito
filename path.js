let createGraph = require('ngraph.graph');
let g = createGraph();
let path = require('ngraph.path');


/* Pra trazer dinamico:
https://wiki.openstreetmap.org/wiki/API_v0.6
Retrieving map data by bounding box: GET /api/0.6/map

GET /api/0.6/map?bbox=left,bottom,right,top
GET /api/0.6/map?bbox=-49.96242,-49.96399,-49.96190,-22.15893
https://api.openstreetmap.org/api/0.6/map?bbox=-49.96242,-49.96399,-49.96190,-22.15893

left is the longitude of the left (westernmost) side of the bounding box.
bottom is the latitude of the bottom (southernmost) side of the bounding box.
right is the longitude of the right (easternmost) side of the bounding box.
top is the latitude of the top (northernmost) side of the bounding box.
*/

/*Rua 1*/
g.addNode('r1-b1', {
	holes:0,
	x: 1,
	y:2
});
g.addNode('r1-b2', {
	holes:0,
	x: 1,
	y: 4
});
g.addNode('r1-b3', {
	holes:0,
	x: 1,
	y: 6
});
g.addNode('r1-b4', {
	holes:0,
	x: 1,
	y: 8
});

/*Rua 2*/
g.addNode('r2-b1', {
	holes:0,
	x: 2,
	y:1
});
g.addNode('r2-b2', {
	holes:0,
	x: 8,
	y: 1
});

/*Rua 3*/
g.addNode('r3-b1', {
	holes:0,
	x: 2,
	y:3
});
g.addNode('r3-b2', {
	holes:0,
	x: 8,
	y: 3
});

/*Rua 4*/
g.addNode('r4-b1', {
	holes:0,
	x: 2,
	y:5
});
g.addNode('r4-b2', {
	holes:0,
	x: 8,
	y: 5
});

/*Rua 5*/
g.addNode('r5-b1', {
	holes:0,
	x: 2,
	y:7
});
g.addNode('r5-b2', {
	holes:0,
	x: 8,
	y: 7
});

/*Rua 6*/
g.addNode('r6-b1', {
	holes:0,
	x: 2,
	y:9
});
g.addNode('r6-b2', {
	holes:0,
	x: 8,
	y: 9
});

/*Rua 7*/
g.addNode('r7-b1', {
	holes:0,
	x: 7,
	y:2
});
g.addNode('r7-b2', {
	holes:0,
	x: 7,
	y: 4
});
g.addNode('r7-b3', {
	holes:0,
	x: 7,
	y: 6
});
g.addNode('r7-b4', {
	holes:0,
	x: 7,
	y: 8
});

/*Adicionando os Links entre as ruas*/

/*Rua 1*/
g.addLink('r1-b1', 'r2-b1',{
	x:1,
	y:1
});
g.addLink('r1-b1', 'r3-b1',{
	x:1,
	y:3
});
g.addLink('r1-b2', 'r3-b1',{
	x:1,
	y:3
});
g.addLink('r1-b2', 'r4-b1',{
	x:1,
	y:5
});
g.addLink('r1-b3', 'r4-b1',{
	x:1,
	y:5
});
g.addLink('r1-b3', 'r5-b1',{
	x:1,
	y:7
});
g.addLink('r1-b4', 'r5-b1',{
	x:1,
	y:7
});
g.addLink('r1-b4', 'r6-b1',{
	x:1,
	y:9
});

/*Rua 7*/
g.addLink('r7-b1', 'r2-b2',{
	x:7,
	y:1
});
g.addLink('r7-b1', 'r3-b2',{
	x:7,
	y:3
});
g.addLink('r7-b2', 'r3-b2',{
	x:7,
	y:3
});
g.addLink('r7-b2', 'r4-b2',{
	x:7,
	y:5
});
g.addLink('r7-b3', 'r4-b2',{
	x:7,
	y:5
});
g.addLink('r7-b3', 'r5-b2',{
	x:7,
	y:7
});
g.addLink('r7-b4', 'r5-b2',{
	x:7,
	y:7
});
g.addLink('r7-b4', 'r6-b2',{
	x:7,
	y:9
});
g.addLink('r7-b1','r2-b1',{
	x:7,
	y:1
});
g.addLink('r7-b1','r3-b1',{
	x:7,
	y:3
});
g.addLink('r7-b2','r3-b1',{
	x:7,
	y:3
});
g.addLink('r7-b2','r4-b1',{
	x:7,
	y:5
});
g.addLink('r7-b3','r4-b1',{
	x:7,
	y:5
});
g.addLink('r7-b3','r5-b1',{
	x:7,
	y:7
});
g.addLink('r7-b4','r5-b1',{
	x:7,
	y:7
});
g.addLink('r7-b4','r6-b1',{
	x:7,
	y:9
});

let pathFinder = path.aStar(g, {
	distance(from, to, link){
		let dx = from.data.x - to.data.x;
	 	let dy = from.data.y - to.data.y;
		return Math.sqrt(dx * dx + dy * dy);
	},
	heuristic(from, to){
		return from.data.holes - to.data.holes;
	}
});

let foundPath = pathFinder.find('r2-b1', 'r5-b2');
console.log(foundPath);
