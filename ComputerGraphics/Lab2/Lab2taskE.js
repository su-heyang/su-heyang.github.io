"use strict";

const { vec3 } = glMatrix;

var canvas;
var gl;

var points = [];

var numTimesToSubdivide = 0;
var rotate = 0;
window.onload = function initTriangles(){
	var taskC = document.getElementById("taskC");
	var c = document.getElementById("c");
	var taskE = document.getElementById("taskE");
	var e = document.getElementById("e");
	canvas = document.getElementById( "gl-canvas" );
	
	gl = WebGLUtils.setupWebGL( canvas );
	if( !gl ){
		alert( "WebGL isn't available" );
	}
	// initialise data for Sierpinski gasket

	// first, initialise the corners of the gasket with three points.
	var vertices = [
		 0,  1,  0,
		 Math.cos(210 * Math.PI / 180.0), Math.sin(210 * Math.PI / 180.0),  0,
		 Math.cos(-30 * Math.PI / 180.0), Math.sin(-30 * Math.PI / 180.0),  0
	];

	var u = vec3.fromValues( vertices[0], vertices[1], vertices[2] );
	var v = vec3.fromValues( vertices[3], vertices[4], vertices[5] );
	var w = vec3.fromValues( vertices[6], vertices[7], vertices[8] );

	divideTriangle( u, v, w, numTimesToSubdivide );

	// configure webgl
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	// load shaders and initialise attribute buffers
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	// load data into gpu
	// Create a cache on the GPU
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
	// Put the data into the cache
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( points ), gl.STATIC_DRAW );

	// associate out shader variables with data buffer
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );

	renderTriangles();
	taskC.onmouseup = function(){
		points = [];
		numTimesToSubdivide = taskC.value;
		c.value = taskC.value;
		initTriangles();
	}
	taskE.onmouseup = function(){
		points = [];
		rotate = taskE.value * Math.PI / 180;
		e.value = taskE.value + "°";
		initTriangles();
	}
};

function triangle( a, b, c ){
	var zerovec3 = vec3.create();
	vec3.zero(zerovec3);
	
	var a1 = vec3.create();
	var b1 = vec3.create();
	var c1 = vec3.create();
	
	var xa = Math.sqrt( a[0] * a[0] + a[1] * a[1] );
	var xb = Math.sqrt( b[0] * b[0] + b[1] * b[1] );
	var xc = Math.sqrt( c[0] * c[0] + c[1] * c[1] );
	
	vec3.set( a1, a[0] * Math.cos(xa * rotate) - a[1] * Math.sin(xa * rotate), 
		a[0] * Math.sin(xa * rotate) + a[1] * Math.cos(xa * rotate), 0 );
	vec3.set(b1, b[0] * Math.cos(xb * rotate) - b[1] * Math.sin(xb * rotate),
		b[0] * Math.sin(xb * rotate) + b[1] * Math.cos(xb * rotate), 0);
	vec3.set(c1, c[0] * Math.cos(xc * rotate) - c[1] * Math.sin(xc * rotate),
		c[0] * Math.sin(xc * rotate) + c[1] * Math.cos(xc * rotate), 0);
	
	points.push( a1[0], a1[1], a1[2] );
	points.push( b1[0], b1[1], b1[2] );
	points.push( b1[0], b1[1], b1[2] );
	points.push( c1[0], c1[1], c1[2] );
	points.push( c1[0], c1[1], c1[2] );
	points.push( a1[0], a1[1], a1[2] );
}

function divideTriangle( a, b, c, count ){
	// check for end of recursion
	if( count == 0 ){
		triangle( a, b, c );
	}else{
		var ab = vec3.create();
		vec3.lerp( ab, a, b, 0.5 );
		var bc = vec3.create();
		vec3.lerp( bc, b, c, 0.5 );
		var ca = vec3.create();
		vec3.lerp( ca, c, a, 0.5 );

		--count;

		// three new triangles
		divideTriangle( a, ab, ca, count );
		divideTriangle( b, bc, ab, count );
		divideTriangle( c, ca, bc, count );
		divideTriangle( ab, ca, bc, count );
	}
}

function renderTriangles(){
	gl.clear( gl.COLOR_BUFFER_BIT );
	gl.drawArrays( gl.LINES, 0, points.length/3 );
}
function inNum(){
	
	if(x == 0) {
		window.
		window.initTriangles();
	}
	if(x == 1) {
		window.numTimesToSubdivide = 1;
		window.initTriangles();
	}
	if(x == 2) {
		window.numTimesToSubdivide = 2;
		window.initTriangles();
	}
	if(x == 3) {
		window.numTimesToSubdivide = 3;
		window.initTriangles();
	}
	if(x == 4) {
		window.numTimesToSubdivide = 4;
		window.initTriangles();
	}
	if(x == 5) {
		window.numTimesToSubdivide = 5;
		window.initTriangles();
	}
	if(x == 6) {
		window.numTimesToSubdivide = 6;
		window.initTriangles();
	}
	if(x == 7) {
		window.numTimesToSubdivide = 7;
		window.initTriangles();
	}
}
