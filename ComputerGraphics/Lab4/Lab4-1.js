"use strict";

var canvas;
var gl;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [0, 0, 0];
var tran = [0, 0, 0];
var zoom = [0, 0, 0];

var thetaLoc;
var tranLoc;
var zoomLoc;

var rotationQuaternion;
var rotationQuaternionLoc;

var angle = 0.0;
var trackBallAxis = [0, 0, 1];

var trackingMouse = false;
var trackballMove = false;

var lastPos = [0, 0, 0];
var curx, cury;
var startx, starty;

window.onload = function initCube() {
    canvas = document.getElementById("rtcb-canvas");
	
	
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    makeCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    // load shaders and initialize attribute buffer
    var program = initShaders(gl, "rtvshader", "rtfshader");
    gl.useProgram(program);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");
    gl.uniform3fv(thetaLoc, theta);
	tranLoc = gl.getUniformLocation(program, "tran");
    gl.uniform3fv(tranLoc, tran);
	zoomLoc = gl.getUniformLocation(program, "zoom");
	gl.uniform3fv(zoomLoc, zoom);
	// document.getElementById("status-static").onclick = function(){
	// 	renderTranslation();
	// }
	// document.getElementById("status-rotate").onclick = function(){
	// 	renderRotate();
	// }
	//taskB: 按钮控制实现旋转的立方体分别在X, Y, Z三条轴向上的平移
	document.getElementById("translation-x+").onclick = function(){
		tran[0]+=0.1;
	}
	document.getElementById("translation-y+").onclick = function(){
		tran[1]+=0.1;
	}
	document.getElementById("translation-z+").onclick = function(){
		tran[2]+=0.1;
	}
	document.getElementById("translation-x-").onclick = function(){
		tran[0]-=0.1;
	}
	document.getElementById("translation-y-").onclick = function(){
		tran[1]-=0.1;
	}
	document.getElementById("translation-z-").onclick = function(){
		tran[2]-=0.1;
	}
	//taskC: 按钮控制实现旋转的立方体分别沿X, Y, Z三条轴向上的缩放
	document.getElementById("magnify").onclick = function(){
		zoom[0]+=0.1;zoom[1]+=0.1;zoom[2]+=0.1;
	}
	document.getElementById("shrink").onclick = function(){
		zoom[0]-=0.1;zoom[1]-=0.1;zoom[2]-=0.1;
	}
	//taskD: 将旋转的控制方式改为鼠标模拟的跟踪球
	rotationQuaternion = glMatrix.vec4.fromValues(1.0, 0.0, 0.0, 0.0);
	rotationQuaternionLoc = gl.getUniformLocation(program, "r");
	gl.uniform4fv(rotationQuaternionLoc, new Float32Array(rotationQuaternion));
	
	canvas.addEventListener("mousedown", function(event){
		var x = event.clientX-canvas.getBoundingClientRect().left;
		var y = event.clientY-canvas.getBoundingClientRect().top;
		startMotion(x, y);
	});
	
	canvas.addEventListener("mouseup", function(event){
		var x = 2*event.clientX/canvas.width-0.1;
		var y = 2*(canvas.height-event.clientY)/canvas.height-0.1;
		stopMotion(x, y);
	});
	
	canvas.addEventListener("mousemove", function(event){
		var x = 2*event.clientX/canvas.width-0.1;
		var y = 2*(canvas.height-event.clientY)/canvas.height-0.1;
		moveMotion(x, y);
	});
	
	canvas.addEventListener("click", function(event) {
		trackBallAxis = [0, 0, 0];
	});
	
	renderRotate();
}
//taskA:按键x、y、z分别控制正方体绕x、y、z轴旋转
function doKeyDown(e){
	e = e || window.event;
	var keyID = e.keyCode?e.keyCode:e.which;
	if(keyID == 88 || keyID == 120){
		axis = xAxis;
	}
	if(keyID == 89 || keyID == 121){
		axis = yAxis;
	}
	if(keyID == 90 || keyID == 122){
		axis = zAxis;
	}
}
function makeCube() {
    var vertices = [
        glMatrix.vec4.fromValues(-0.5, -0.5, 0.5, 1.0),
        glMatrix.vec4.fromValues(-0.5, 0.5, 0.5, 1.0),
        glMatrix.vec4.fromValues(0.5, 0.5, 0.5, 1.0),
        glMatrix.vec4.fromValues(0.5, -0.5, 0.5, 1.0),
        glMatrix.vec4.fromValues(-0.5, -0.5, -0.5, 1.0),
        glMatrix.vec4.fromValues(-0.5, 0.5, -0.5, 1.0),
        glMatrix.vec4.fromValues(0.5, 0.5, -0.5, 1.0),
        glMatrix.vec4.fromValues(0.5, -0.5, -0.5, 1.0),
    ];

    var vertexColors = [
        glMatrix.vec4.fromValues(0.0, 0.0, 0.0, 1.0),
        glMatrix.vec4.fromValues(1.0, 0.0, 0.0, 1.0),
        glMatrix.vec4.fromValues(1.0, 1.0, 0.0, 1.0),
        glMatrix.vec4.fromValues(0.0, 1.0, 0.0, 1.0),
        glMatrix.vec4.fromValues(0.0, 0.0, 1.0, 1.0),
        glMatrix.vec4.fromValues(1.0, 0.0, 1.0, 1.0),
        glMatrix.vec4.fromValues(0.0, 1.0, 1.0, 1.0),
        glMatrix.vec4.fromValues(1.0, 1.0, 1.0, 1.0)
    ];

    var faces = [
        1, 0, 3, 1, 3, 2, //正
        2, 3, 7, 2, 7, 6, //右
        3, 0, 4, 3, 4, 7, //底
        6, 5, 1, 6, 1, 2, //顶
        4, 5, 6, 4, 6, 7, //背
        5, 4, 0, 5, 0, 1  //左
    ];

    for (var i = 0; i < faces.length; i++) {
        points.push(vertices[faces[i]][0], vertices[faces[i]][1], vertices[faces[i]][2]);

        colors.push(vertexColors[Math.floor(i / 6)][0], vertexColors[Math.floor(i / 6)][1], vertexColors[Math.floor(i / 6)][2], vertexColors[Math.floor(i / 6)][3]);
    }
}
function startMotion(x, y){
	trackingMouse = true;
	startx = x;
	starty = y;
	curx = x;
	cury = y;
	
	lastPos = trackballView(x, y);
	trackballMove = true;
}

function stopMotion( x, y ){
	trackingMouse = false;
	if( startx != x || starty != y ){
	}else{
		angle = 0.0;
		trackballMove = false;
	}
}
function trackballView(x, y){
	var d, a;
	var v = [];

	v[0] = x;
	v[1] = y;

	d = v[0]*v[0]+v[1]*v[1];
	if( d < 1.0 ){
		v[2] = Math.sqrt(1.0 - d);
	}else{
		v[2] = 0.0;
		a = 1.0/Math.sqrt(d);
		v[0] *= a;
		v[1] *= a;
	}
	return v;
}
function moveMotion(x, y){
	var dx, dy, dz;
	
	var curPos = trackballView(x, y);
	if(trackingMouse){
		dx = curPos[0] - lastPos[0];
		dy = curPos[1] - lastPos[1];
		dz = curPos[2] - lastPos[2];
	
		if(dx||dy||dz){
			angle = -1.0*Math.sqrt(dx*dx + dy*dy + dz*dz);
	
			trackBallAxis[0] = lastPos[1] * curPos[2] - lastPos[2] * curPos[1];
			trackBallAxis[1] = lastPos[2] * curPos[0] - lastPos[0] * curPos[2];
			trackBallAxis[2] = lastPos[0] * curPos[1] - lastPos[1] * curPos[0];
	
			lastPos[0] = curPos[0];
			lastPos[1] = curPos[1];
			lastPos[2] = curPos[2];
		}
	}
	renderRotate();
}
function renderRotate() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 0.1;
    gl.uniform3fv(thetaLoc, theta);
	gl.uniform3fv(tranLoc, tran);
	gl.uniform3fv(zoomLoc, zoom);
	if(trackballMove){
		glMatrix.vec3.normalize(trackBallAxis, trackBallAxis);
		var cosa = Math.cos(angle/2.0);
		var sina = Math.sin(angle/2.0);
		
		var rotation = glMatrix.vec4.fromValues(cosa, sina*trackBallAxis[0], sina*trackBallAxis[1], sina*trackBallAxis[2]);
		rotationQuaternion = multq(rotationQuaternion, rotation);
		gl.uniform4fv(rotationQuaternionLoc, new Float32Array(rotationQuaternion)); 
	}
    gl.drawArrays(gl.TRIANGLES, 0, points.length / 3);

    requestAnimFrame(renderRotate);	
}
// 键盘事件触发函数
window.onkeydown = doKeyDown;