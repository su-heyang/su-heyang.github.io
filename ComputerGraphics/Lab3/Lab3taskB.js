"use strict";

var canvas;
var gl;

var theta = 0.0;
var thetaLoc;
var direction = 1;
var speed = 50;
var points = [];
var R = [0, 0.75];
var r = 0.25;
var n = 360;

function changeDir(){
	direction *= -1;
}

function initRotSquare(){
	canvas = document.getElementById( "rot-canvas" );
	gl = WebGLUtils.setupWebGL( canvas, "experimental-webgl" );
	if( !gl ){
		alert( "WebGL isn't available" );
	}

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	var program = initShaders( gl, "rot-v-shader", "rot-f-shader" );
	gl.useProgram( program );

	// 矩形和三角形的坐标向量
	var vertices = [
		-0.25, 0.5,
		 0.25, 0.5,
		-0.25,-0.5,
		 0.25,-0.5,
		 0,-0.5,
		-0.25, -(0.5 + Math.sqrt(3)/4),
		 0.25, -(0.5 + Math.sqrt(3)/4)
	];
	
	DrawCircular(vertices);
	
	var bufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( points ), gl.STATIC_DRAW );

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );

	thetaLoc = gl.getUniformLocation( program, "theta" );

	document.getElementById( "speedcon" ).onchange = function( event ){
		speed = 100 - event.target.value;
	}

	renderSquare();
}

// DrawCircular方法用来填入points圆、矩形、三角形的坐标
function DrawCircular(ver){

	var jiao = 360 / n * Math.PI / 180;
	points.push(R[0], R[1]);
	for(var i = 0; i <= n; i++){
		points.push(R[0] + r * Math.sin(jiao * i), R[1] + r * Math.cos(jiao * i));
	}
	points.push(R[0] + r * Math.sin(jiao * 0), R[1] + r * Math.cos(jiao * 0));
	for(var i = 0; i < 14; i+=2){
		points.push(ver[i], ver[i+1]);
	}
	// points.push(-0.25, 0.5);
	// points.push( 0.25, 0.5);
	// points.push( 0.25,-0.5);
	// points.push(-0.25, 0.5);
	// points.push( 0.25,-0.5);
	// points.push(-0.25,-0.5);
	// points.push( 0,-0.5);
	// points.push(-0.25, -(0.5 + Math.sqrt(3)/4));
	// points.push( 0.25, -(0.5 + Math.sqrt(3)/4));
}

function renderSquare(){
	gl.clear( gl.COLOR_BUFFER_BIT );
	
	// set uniform values
	theta += direction * 0.1;
	
	gl.uniform1f( thetaLoc, theta );
	// 绘制圆形
	gl.drawArrays( gl.TRIANGLE_FAN, 0, n+3 );
	// 绘制矩形
	gl.drawArrays( gl.TRIANGLE_STRIP, n+3, 4 );
	// 绘制三角形
	gl.drawArrays( gl.TRIANGLES, n+7, 3);
	// gl.drawArrays( gl.TRIANGLES, n+3, 9);

	// update and render
	setTimeout( function(){ requestAnimFrame( renderSquare ); }, speed );
}