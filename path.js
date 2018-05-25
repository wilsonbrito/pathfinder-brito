let createGraph = require('ngraph.graph');
let g = createGraph();
let path = require('ngraph.path');

/*Rua1*/
g.addNode('r1-b1', {
	holes:0,
	semaphore:0,
	x: 1,
	y:2
});
g.addNode('r1-b2', {
	holes:0,
	semaphore:0,
	x: 1,
	y: 4
});
g.addNode('r1-b3', {
	holes:0,
	semaphore:0,
	x: 1,
	y: 6
});
g.addNode('r1-b4', {
	holes:0,
	semaphore:0,
	x: 1,
	y: 8
});



/*Rua7*/
g.addNode('r7-b1', {
	holes:0,
	semaphore:0,
	x: 12,
	y:2
});
g.addNode('r7-b2', {
	holes:0,
	semaphore:0,
	x: 12,
	y: 4
});
g.addNode('r7-b3', {
	holes:0,
	semaphore:0,
	x: 12,
	y: 6
});
g.addNode('r7-b4', {
	holes:0,
	semaphore:0,
	x: 12,
	y: 8
});



/*Rua8*/
g.addNode('r8-b1', {
	holes:0,
	semaphore:0,
	x: 23,
	y:2
});
g.addNode('r8-b2', {
	holes:0,
	semaphore:0,
	x: 23,
	y: 4
});
g.addNode('r8-b3', {
	holes:0,
	semaphore:0,
	x: 23,
	y: 6
});
g.addNode('r8-b4', {
	holes:0,
	semaphore:0,
	x: 23,
	y: 8
});




/*Rua2*/
g.addNode('r2-b1-01', {
	holes:1,
	semaphore:0,
	x: 2,
	y:1
});
g.addNode('r2-b1-02', {
	holes:0,
	semaphore:0,
	x: 4,
	y:1
});
g.addNode('r2-b1-03', {
	holes:0,
	semaphore:0,
	x: 6,
	y:1
});
g.addNode('r2-b1-04', {
	holes:0,
	semaphore:0,
	x: 8,
	y:1
});
g.addNode('r2-b1-05', {
	holes:0,
	semaphore:0,
	x: 10,
	y:1
});
g.addNode('r2-b1-06', {
	holes:0,
	semaphore:0,
	x: 12,
	y:1
});
g.addNode('r2-b1-07', {
	holes:0,
	semaphore:0,
	x: 14,
	y:1
});
g.addNode('r2-b1-08', {
	holes:0,
	semaphore:0,
	x: 16,
	y:1
});
g.addNode('r2-b1-09', {
	holes:0,
	semaphore:0,
	x: 18,
	y:1
});
g.addNode('r2-b1-10', {
	holes:0,
	semaphore:0,
	x: 20,
	y:1
});

/*Rua2-Bloco2*/
g.addNode('r2-b2-01', {
	holes:0,
	semaphore:0,
	x: 22,
	y:1
});
g.addNode('r2-b2-02', {
	holes:0,
	semaphore:0,
	x: 24,
	y:1
});
g.addNode('r2-b2-03', {
	holes:0,
	semaphore:0,
	x: 26,
	y:1
});
g.addNode('r2-b2-04', {
	holes:0,
	semaphore:0,
	x: 28,
	y:1
});
g.addNode('r2-b2-05', {
	holes:0,
	semaphore:0,
	x: 30,
	y:1
});
g.addNode('r2-b2-06', {
	holes:0,
	semaphore:0,
	x: 32,
	y:1
});
g.addNode('r2-b2-07', {
	holes:0,
	semaphore:0,
	x: 34,
	y:1
});
g.addNode('r2-b2-08', {
	holes:0,
	semaphore:0,
	x: 36,
	y:1
});
g.addNode('r2-b2-09', {
	holes:0,
	semaphore:0,
	x: 38,
	y:1
});
g.addNode('r2-b2-10', {
	holes:0,
	semaphore:0,
	x: 40,
	y:1
});




/*Rua3*/
g.addNode('r3-b1-01', {
	holes:2,
	semaphore:0,
	x: 2,
	y:3
});
g.addNode('r3-b1-02', {
	holes:0,
	semaphore:0,
	x: 4,
	y:3
});
g.addNode('r3-b1-03', {
	holes:0,
	semaphore:0,
	x: 6,
	y:3
});
g.addNode('r3-b1-04', {
	holes:0,
	semaphore:0,
	x: 8,
	y:3
});
g.addNode('r3-b1-05', {
	holes:0,
	semaphore:0,
	x: 10,
	y:3
});
g.addNode('r3-b1-06', {
	holes:0,
	semaphore:0,
	x: 12,
	y:3
});
g.addNode('r3-b1-07', {
	holes:0,
	semaphore:0,
	x: 14,
	y:3
});
g.addNode('r3-b1-08', {
	holes:0,
	semaphore:0,
	x: 16,
	y:3
});
g.addNode('r3-b1-09', {
	holes:0,
	semaphore:0,
	x: 18,
	y:3
});
g.addNode('r3-b1-10', {
	holes:0,
	semaphore:0,
	x: 20,
	y:3
});




/*Rua3-Bloco2*/
g.addNode('r3-b2-01', {
	holes:0,
	semaphore:0,
	x: 22,
	y:3
});
g.addNode('r3-b2-02', {
	holes:0,
	semaphore:0,
	x: 24,
	y:3
});
g.addNode('r3-b2-03', {
	holes:0,
	semaphore:0,
	x: 26,
	y:3
});
g.addNode('r3-b2-04', {
	holes:0,
	semaphore:0,
	x: 28,
	y:3
});
g.addNode('r3-b2-05', {
	holes:0,
	semaphore:0,
	x: 30,
	y:3
});
g.addNode('r3-b2-06', {
	holes:0,
	semaphore:0,
	x: 32,
	y:3
});
g.addNode('r3-b2-07', {
	holes:0,
	semaphore:0,
	x: 34,
	y:3
});
g.addNode('r3-b2-08', {
	holes:0,
	semaphore:0,
	x: 36,
	y:3
});
g.addNode('r3-b2-09', {
	holes:0,
	semaphore:0,
	x: 38,
	y:3
});
g.addNode('r3-b2-10', {
	holes:0,
	semaphore:0,
	x: 40,
	y:3
});




/*Rua4*/
g.addNode('r4-b1-01', {
	holes:0,
	semaphore:0,
	x: 2,
	y:5
});
g.addNode('r4-b1-02', {
	holes:0,
	semaphore:0,
	x: 4,
	y:5
});
g.addNode('r4-b1-03', {
	holes:0,
	semaphore:0,
	x: 6,
	y:5
});
g.addNode('r4-b1-04', {
	holes:0,
	semaphore:0,
	x: 8,
	y:5
});
g.addNode('r4-b1-05', {
	holes:0,
	semaphore:0,
	x: 10,
	y:5
});
g.addNode('r4-b1-06', {
	holes:0,
	semaphore:0,
	x: 12,
	y:5
});
g.addNode('r4-b1-07', {
	holes:0,
	semaphore:0,
	x: 14,
	y:5
});
g.addNode('r4-b1-08', {
	holes:0,
	semaphore:0,
	x: 16,
	y:5
});
g.addNode('r4-b1-09', {
	holes:0,
	semaphore:0,
	x: 18,
	y:5
});
g.addNode('r4-b1-10', {
	holes:0,
	semaphore:0,
	x: 20,
	y:5
});




/*Rua4-Bloco2*/
g.addNode('r4-b2-01', {
	holes:0,
	semaphore:0,
	x: 22,
	y:5
});
g.addNode('r4-b2-02', {
	holes:0,
	semaphore:0,
	x: 24,
	y:5
});
g.addNode('r4-b2-03', {
	holes:0,
	semaphore:0,
	x: 26,
	y:5
});
g.addNode('r4-b2-04', {
	holes:0,
	semaphore:0,
	x: 28,
	y:5
});
g.addNode('r4-b2-05', {
	holes:0,
	semaphore:0,
	x: 30,
	y:5
});
g.addNode('r4-b2-06', {
	holes:0,
	semaphore:0,
	x: 32,
	y:5
});
g.addNode('r4-b2-07', {
	holes:0,
	semaphore:0,
	x: 34,
	y:5
});
g.addNode('r4-b2-08', {
	holes:0,
	semaphore:0,
	x: 36,
	y:5
});
g.addNode('r4-b2-09', {
	holes:0,
	semaphore:0,
	x: 38,
	y:5
});
g.addNode('r4-b2-10', {
	holes:0,
	semaphore:0,
	x: 40,
	y:5
});




/*Rua5*/
g.addNode('r5-b1-01', {
	holes:0,
	semaphore:0,
	x: 2,
	y:7
});
g.addNode('r5-b1-02', {
	holes:0,
	semaphore:0,
	x: 4,
	y:7
});
g.addNode('r5-b1-03', {
	holes:0,
	semaphore:0,
	x: 6,
	y:7
});
g.addNode('r5-b1-04', {
	holes:0,
	semaphore:0,
	x: 8,
	y:7
});
g.addNode('r5-b1-05', {
	holes:0,
	semaphore:0,
	x: 10,
	y:7
});
g.addNode('r5-b1-06', {
	holes:0,
	semaphore:0,
	x: 12,
	y:7
});
g.addNode('r5-b1-07', {
	holes:0,
	semaphore:0,
	x: 14,
	y:7
});
g.addNode('r5-b1-08', {
	holes:0,
	semaphore:0,
	x: 16,
	y:7
});
g.addNode('r5-b1-09', {
	holes:0,
	semaphore:0,
	x: 18,
	y:7
});
g.addNode('r5-b1-10', {
	holes:0,
	semaphore:0,
	x: 20,
	y:7
});




/*Rua5-Bloco2*/
g.addNode('r5-b2-01', {
	holes:0,
	semaphore:0,
	x: 22,
	y:7
});
g.addNode('r5-b2-02', {
	holes:0,
	semaphore:0,
	x: 24,
	y:7
});
g.addNode('r5-b2-03', {
	holes:0,
	semaphore:0,
	x: 26,
	y:7
});
g.addNode('r5-b2-04', {
	holes:0,
	semaphore:0,
	x: 28,
	y:7
});
g.addNode('r5-b2-05', {
	holes:0,
	semaphore:0,
	x: 30,
	y:7
});
g.addNode('r5-b2-06', {
	holes:0,
	semaphore:0,
	x: 32,
	y:7
});
g.addNode('r5-b2-07', {
	holes:0,
	semaphore:0,
	x: 34,
	y:7
});
g.addNode('r5-b2-08', {
	holes:0,
	semaphore:0,
	x: 36,
	y:7
});
g.addNode('r5-b2-09', {
	holes:0,
	semaphore:0,
	x: 38,
	y:7
});
g.addNode('r5-b2-10', {
	holes:0,
	semaphore:0,
	x: 40,
	y:7
});




/*Rua6*/
g.addNode('r6-b1-01', {
	holes:0,
	semaphore:0,
	x: 2,
	y:9
});
g.addNode('r6-b1-02', {
	holes:0,
	semaphore:0,
	x: 4,
	y:9
});
g.addNode('r6-b1-03', {
	holes:0,
	semaphore:0,
	x: 6,
	y:9
});
g.addNode('r6-b1-04', {
	holes:0,
	semaphore:0,
	x: 8,
	y:9
});
g.addNode('r6-b1-05', {
	holes:0,
	semaphore:0,
	x: 10,
	y:9
});
g.addNode('r6-b1-06', {
	holes:0,
	semaphore:0,
	x: 12,
	y:9
});
g.addNode('r6-b1-07', {
	holes:0,
	semaphore:0,
	x: 14,
	y:9
});
g.addNode('r6-b1-08', {
	holes:0,
	semaphore:0,
	x: 16,
	y:9
});
g.addNode('r6-b1-09', {
	holes:0,
	semaphore:0,
	x: 18,
	y:9
});
g.addNode('r6-b1-10', {
	holes:0,
	semaphore:0,
	x: 20,
	y:9
});




/*Rua6-Bloco2*/
g.addNode('r6-b2-01', {
	holes:0,
	semaphore:0,
	x: 22,
	y:9
});
g.addNode('r6-b2-02', {
	holes:0,
	semaphore:0,
	x: 24,
	y:9
});
g.addNode('r6-b2-03', {
	holes:0,
	semaphore:0,
	x: 26,
	y:9
});
g.addNode('r6-b2-04', {
	holes:0,
	semaphore:0,
	x: 28,
	y:9
});
g.addNode('r6-b2-05', {
	holes:0,
	semaphore:0,
	x: 30,
	y:9
});
g.addNode('r6-b2-06', {
	holes:0,
	semaphore:0,
	x: 32,
	y:9
});
g.addNode('r6-b2-07', {
	holes:0,
	semaphore:0,
	x: 34,
	y:9
});
g.addNode('r6-b2-08', {
	holes:0,
	semaphore:0,
	x: 36,
	y:9
});
g.addNode('r6-b2-09', {
	holes:0,
	semaphore:0,
	x: 38,
	y:9
});
g.addNode('r6-b2-10', {
	holes:0,
	semaphore:0,
	x: 40,
	y:9
});




/*LINKS GERAL*/
/*Links da Rua 1*/
g.addLink('r1-b1', 'r2-b1-01',{
	x:1,
	y:1
});
g.addLink('r1-b1', 'r3-b1-01',{
	x:1,
	y:3
});
g.addLink('r1-b2', 'r3-b1-01',{
	x:1,
	y:3
});
g.addLink('r1-b2', 'r4-b1-01',{
	x:1,
	y:5
});
g.addLink('r1-b3', 'r4-b1-01',{
	x:1,
	y:5
});
g.addLink('r1-b3', 'r5-b1-01',{
	x:1,
	y:7
});
g.addLink('r1-b4', 'r5-b1-01',{
	x:1,
	y:7
});
g.addLink('r1-b4', 'r6-b1-01',{
	x:1,
	y:9
});





/*Links da Rua 7*/
g.addLink('r7-b1', 'r2-b2-01',{
	x:21,
	y:1
});
g.addLink('r7-b1', 'r2-b1-10',{
	x:21,
	y:1
});
g.addLink('r7-b1', 'r3-b1-10',{
	x:21,
	y:3
});
g.addLink('r7-b1', 'r3-b2-01',{
	x:21,
	y:3
});
g.addLink('r7-b2', 'r3-b1-10',{
	x:21,
	y:3
});
g.addLink('r7-b2', 'r3-b2-01',{
	x:21,
	y:3
});
g.addLink('r7-b2', 'r4-b1-10',{
	x:21,
	y:5
});
g.addLink('r7-b2', 'r4-b2-01',{
	x:21,
	y:5
});
g.addLink('r7-b3', 'r4-b1-10',{
	x:21,
	y:5
});
g.addLink('r7-b3', 'r4-b2-01',{
	x:21,
	y:5
});
g.addLink('r7-b3', 'r5-b1-10',{
	x:21,
	y:7
});
g.addLink('r7-b3', 'r5-b2-01',{
	x:21,
	y:7
});
g.addLink('r7-b4', 'r5-b1-10',{
	x:21,
	y:7
});
g.addLink('r7-b4', 'r5-b2-01',{
	x:21,
	y:7
});
g.addLink('r7-b4', 'r6-b1-10',{
	x:21,
	y:9
});
g.addLink('r7-b4', 'r6-b2-01',{
	x:21,
	y:9
});




/*Links da Rua 8*/
g.addLink('r8-b1', 'r2-b2-10',{
	x:41,
	y:1
});
g.addLink('r8-b1', 'r3-b2-10',{
	x:41,
	y:3
});
g.addLink('r8-b2', 'r3-b2-10',{
	x:41,
	y:3
});
g.addLink('r8-b2', 'r4-b2-10',{
	x:41,
	y:5
});
g.addLink('r8-b3', 'r4-b2-10',{
	x:41,
	y:5
});
g.addLink('r8-b3', 'r5-b2-10',{
	x:41,
	y:7
});
g.addLink('r8-b4', 'r5-b2-10',{
	x:41,
	y:7
});
g.addLink('r8-b4', 'r6-b2-10',{
	x:41,
	y:9
});




/*Links da rua 2 - Bloco 1*/
g.addLink('r2-b1-01', 'r2-b1-02',{
	x:3,
	y:1
});
g.addLink('r2-b1-02', 'r2-b1-03',{
	x:5,
	y:1
});
g.addLink('r2-b1-03', 'r2-b1-04',{
	x:7,
	y:1
});
g.addLink('r2-b1-04', 'r2-b1-05',{
	x:9,
	y:1
});
g.addLink('r2-b1-05', 'r2-b1-06',{
	x:11,
	y:1
});
g.addLink('r2-b1-06', 'r2-b1-07',{
	x:13,
	y:1
});
g.addLink('r2-b1-07', 'r2-b1-08',{
	x:15,
	y:1
});
g.addLink('r2-b1-08', 'r2-b1-09',{
	x:17,
	y:1
});
g.addLink('r2-b1-09', 'r2-b1-10',{
	x:19,
	y:1
});




/*Links da rua 3 - Bloco 1*/
g.addLink('r3-b1-01', 'r3-b1-02',{
	x:3,
	y:3
});
g.addLink('r3-b1-02', 'r3-b1-03',{
	x:5,
	y:3
});
g.addLink('r3-b1-03', 'r3-b1-04',{
	x:7,
	y:3
});
g.addLink('r3-b1-04', 'r3-b1-05',{
	x:9,
	y:3
});
g.addLink('r3-b1-05', 'r3-b1-06',{
	x:11,
	y:3
});
g.addLink('r3-b1-06', 'r3-b1-07',{
	x:13,
	y:3
});
g.addLink('r3-b1-07', 'r3-b1-08',{
	x:15,
	y:3
});
g.addLink('r3-b1-08', 'r3-b1-09',{
	x:17,
	y:3
});
g.addLink('r3-b1-09', 'r3-b1-10',{
	x:19,
	y:3
});




/*Links da rua 4 - Bloco 1*/
g.addLink('r4-b1-01', 'r4-b1-02',{
	x:3,
	y:5
});
g.addLink('r4-b1-02', 'r4-b1-03',{
	x:5,
	y:5
});
g.addLink('r4-b1-03', 'r4-b1-04',{
	x:7,
	y:5
});
g.addLink('r4-b1-04', 'r4-b1-05',{
	x:9,
	y:5
});
g.addLink('r4-b1-05', 'r4-b1-06',{
	x:11,
	y:5
});
g.addLink('r4-b1-06', 'r4-b1-07',{
	x:13,
	y:5
});
g.addLink('r4-b1-07', 'r4-b1-08',{
	x:15,
	y:5
});
g.addLink('r4-b1-08', 'r4-b1-09',{
	x:17,
	y:5
});
g.addLink('r4-b1-09', 'r4-b1-10',{
	x:19,
	y:5
});



/*Links da rua 5 - Bloco 1*/
g.addLink('r5-b1-01', 'r5-b1-02',{
	x:3,
	y:7
});
g.addLink('r5-b1-02', 'r5-b1-03',{
	x:5,
	y:7
});
g.addLink('r5-b1-03', 'r5-b1-04',{
	x:7,
	y:7
});
g.addLink('r5-b1-04', 'r5-b1-05',{
	x:9,
	y:7
});
g.addLink('r5-b1-05', 'r5-b1-06',{
	x:11,
	y:7
});
g.addLink('r5-b1-06', 'r5-b1-07',{
	x:13,
	y:7
});
g.addLink('r5-b1-07', 'r5-b1-08',{
	x:15,
	y:7
});
g.addLink('r5-b1-08', 'r5-b1-09',{
	x:17,
	y:7
});
g.addLink('r5-b1-09', 'r5-b1-10',{
	x:19,
	y:7
});




/*Links da rua 6 - Bloco 1*/
g.addLink('r6-b1-01', 'r6-b1-02',{
	x:3,
	y:9
});
g.addLink('r6-b1-02', 'r6-b1-03',{
	x:5,
	y:9
});
g.addLink('r6-b1-03', 'r6-b1-04',{
	x:7,
	y:9
});
g.addLink('r6-b1-04', 'r6-b1-05',{
	x:9,
	y:9
});
g.addLink('r6-b1-05', 'r6-b1-06',{
	x:11,
	y:9
});
g.addLink('r6-b1-06', 'r6-b1-07',{
	x:13,
	y:9
});
g.addLink('r6-b1-07', 'r6-b1-08',{
	x:15,
	y:9
});
g.addLink('r6-b1-08', 'r6-b1-09',{
	x:17,
	y:9
});
g.addLink('r6-b1-09', 'r6-b1-10',{
	x:19,
	y:9
});




/*BLOCO DOIS*/
/*Links da rua 2 - Bloco 2*/
g.addLink('r2-b2-01', 'r2-b2-02',{
	x:23,
	y:1
});
g.addLink('r2-b2-02', 'r2-b2-03',{
	x:25,
	y:1
});
g.addLink('r2-b2-03', 'r2-b2-04',{
	x:27,
	y:1
});
g.addLink('r2-b2-04', 'r2-b2-05',{
	x:29,
	y:1
});
g.addLink('r2-b2-05', 'r2-b2-06',{
	x:31,
	y:1
});
g.addLink('r2-b2-06', 'r2-b2-07',{
	x:33,
	y:1
});
g.addLink('r2-b2-07', 'r2-b2-08',{
	x:35,
	y:1
});
g.addLink('r2-b2-08', 'r2-b2-09',{
	x:37,
	y:1
});
g.addLink('r2-b2-09', 'r2-b2-10',{
	x:39,
	y:1
});


/*Links da rua 3 - Bloco 2*/
g.addLink('r3-b2-01', 'r3-b2-02',{
	x:23,
	y:3
});
g.addLink('r3-b2-02', 'r3-b2-03',{
	x:25,
	y:3
});
g.addLink('r3-b2-03', 'r3-b2-04',{
	x:27,
	y:3
});
g.addLink('r3-b2-04', 'r3-b2-05',{
	x:29,
	y:3
});
g.addLink('r3-b2-05', 'r3-b2-06',{
	x:31,
	y:3
});
g.addLink('r3-b2-06', 'r3-b2-07',{
	x:33,
	y:3
});
g.addLink('r3-b2-07', 'r3-b2-08',{
	x:35,
	y:3
});
g.addLink('r3-b2-08', 'r3-b2-09',{
	x:37,
	y:3
});
g.addLink('r3-b2-09', 'r3-b2-10',{
	x:39,
	y:3
});



/*Links da rua 4 - Bloco 2*/
g.addLink('r4-b1-01', 'r4-b1-02',{
	x:23,
	y:5
});
g.addLink('r4-b2-02', 'r4-b2-03',{
	x:25,
	y:5
});
g.addLink('r4-b2-03', 'r4-b2-04',{
	x:27,
	y:5
});
g.addLink('r4-b2-04', 'r4-b2-05',{
	x:29,
	y:5
});
g.addLink('r4-b2-05', 'r4-b2-06',{
	x:31,
	y:5
});
g.addLink('r4-b2-06', 'r4-b2-07',{
	x:33,
	y:5
});
g.addLink('r4-b2-07', 'r4-b2-08',{
	x:35,
	y:5
});
g.addLink('r4-b2-08', 'r4-b2-09',{
	x:37,
	y:5
});
g.addLink('r4-b2-09', 'r4-b2-10',{
	x:39,
	y:5
});



/*Links da rua 5 - Bloco 2*/
g.addLink('r5-b2-01', 'r5-b2-02',{
	x:23,
	y:7
});
g.addLink('r5-b2-02', 'r5-b2-03',{
	x:25,
	y:7
});
g.addLink('r5-b2-03', 'r5-b2-04',{
	x:27,
	y:7
});
g.addLink('r5-b2-04', 'r5-b2-05',{
	x:29,
	y:7
});
g.addLink('r5-b2-05', 'r5-b2-06',{
	x:31,
	y:7
});
g.addLink('r5-b2-06', 'r5-b2-07',{
	x:33,
	y:7
});
g.addLink('r5-b2-07', 'r5-b2-08',{
	x:35,
	y:7
});
g.addLink('r5-b2-08', 'r5-b2-09',{
	x:37,
	y:7
});
g.addLink('r5-b2-09', 'r5-b2-10',{
	x:39,
	y:7
});



/*Links da rua 6 - Bloco 2*/
g.addLink('r6-b2-01', 'r6-b2-02',{
	x:23,
	y:9
});
g.addLink('r6-b2-02', 'r6-b2-03',{
	x:25,
	y:9
});
g.addLink('r6-b2-03', 'r6-b2-04',{
	x:27,
	y:9
});
g.addLink('r6-b2-04', 'r6-b2-05',{
	x:29,
	y:9
});
g.addLink('r6-b2-05', 'r6-b2-06',{
	x:31,
	y:9
});
g.addLink('r6-b2-06', 'r6-b2-07',{
	x:33,
	y:9
});
g.addLink('r6-b2-07', 'r6-b2-08',{
	x:35,
	y:9
});
g.addLink('r6-b2-08', 'r6-b2-09',{
	x:37,
	y:9
});
g.addLink('r6-b2-09', 'r6-b2-10',{
	x:39,
	y:9
});

/*Distance*/
let totaldistance = 0;
let arredondado = 0;

/*heuristic*/
let holes = 0;
let semaphore = 0;
let result = 0;

let pathFinder = path.aStar(g, {
	distance(from, to, link){
		let dx = from.data.x - to.data.x;
	 	let dy = from.data.y - to.data.y;
		let distance = Math.sqrt(dx * dx + dy * dy);
		arredondado = parseFloat(distance.toFixed(3));
		totaldistance += arredondado;
		return arredondado;
	},
	heuristic(from, to, link){
		let holes = from.data.holes - to.data.holes;
		let semaphore = from.data.semaphore - to.data.semaphore;
		let calc = Math.sqrt(holes * holes + semaphore * semaphore);
		result = parseFloat(calc.toFixed(1));
		return result
	}
});

let foundPath = pathFinder.find('r1-b1', 'r7-b1');

// console.log("--------------------------------------------------------------------------------");
// console.log(foundPath);
// console.log("--------------------------------------------------------------------------------");
//console.log("\n\n\nTotal Distance   ----------------------------------->"+totaldistance+"\n\n");
foundPath.forEach(function(node){
	console.log("Node"+node)
	var nodeSelector = node.id;
	console.log('.' + nodeSelector + " .ico");
	//console.log("Resultado"+result);
	document.querySelector( '.' + nodeSelector + " .ico").setAttribute('fill', 'green')
});