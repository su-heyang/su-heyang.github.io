//导入three.js的模型和模型相关配置
			import * as THREE from 'https://techbrood.com/threejs/build/three.module.js';
			import Stats from 'https://techbrood.com/threejs/examples/jsm/libs/stats.module.js';
			import { GLTFLoader } from 'https://techbrood.com/threejs/examples/jsm/loaders/GLTFLoader.js';
			
			let camera, scene, renderer, controls;
			const mixers = [];
			let stats;
			const clock = new THREE.Clock(); //设定时间变量clock用于内容重绘

			//---------------------------------------------------------------------------------
			var mesh, geometry, material;
			var mouseX = 0, mouseY = 0;
			var start_time = Date.now();
			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;
			//---------------------------------------------------------------------------------
			//初始化
			init();
			//动画展示
			animate();
			
			function init() {
				const container = document.getElementById( 'container' ); //container用于显示网页运行的各个实时状态指标

				//---------------------------------------------------------------------------------
				// Bg gradient

				var canvas = document.createElement( 'canvas' );
				canvas.width = 32;
				canvas.height = window.innerHeight;

				//create linear gradient
				var context = canvas.getContext( '2d' );
				var gradient = context.createLinearGradient( 0, 0, 0, canvas.height );
				gradient.addColorStop(0, "#1e4877");
				gradient.addColorStop(0.5, "#4584b4");
				context.fillStyle = gradient;
				context.fillRect(0, 0, canvas.width, canvas.height);

				container.style.background = 'url(' + canvas.toDataURL('image/png') + ')';
				container.style.backgroundSize = '32px 100%';

				//---------------------------------------------------------------------------------

				camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 3000 );
				camera.position.z = 3000;
				//创建环境
				scene = new THREE.Scene();
				scene.background = new THREE.Color("#4584b4");
				scene.fog = new THREE.Fog( scene.background, 1, 1000 ); // 生成雾化效果在相对于摄像机的1到1000之间的距离显示
				geometry = new THREE.Geometry();
				
				//------------------------------------------------------------------------------
				
				//添加环境光
				const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
				hemiLight.color.setHSL( 0.6, 1, 0.6 );
				hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
				hemiLight.position.set( 0, 55, 0 );
				scene.add( hemiLight );

				//添加平行光
				const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
				dirLight.color.setHSL( 0.1, 1, 0.95 );
				dirLight.position.set( - 1, 1.75, 1 );
				dirLight.position.multiplyScalar( 30 );
				scene.add( dirLight );
			
				//制作云层动画效果
				
				// 云层的范围大小和形状随机生成
				var plane = new THREE.Mesh( new THREE.PlaneGeometry( 64, 64 ) ); 
				for ( var i = 0; i < 8000; i++ ) {
					plane.position.x = Math.random() * 1000 - 500;
					plane.position.y = - Math.random() * Math.random() * 200 - 15;
					plane.position.z = i;
					plane.rotation.z = Math.random() * Math.PI;
					plane.scale.x = plane.scale.y = Math.random() * Math.random() * 1.5 + 0.5;
					THREE.GeometryUtils.merge( geometry, plane );
				}
				
				var texture = THREE.ImageUtils.loadTexture( 'cloud.png');
				texture.magFilter = THREE.LinearMipMapLinearFilter;
				texture.minFilter = THREE.LinearMipMapLinearFilter;
				var fog = new THREE.Fog( 0x4584b4, - 100, 3000 ); //新增雾化的颜色、范围
				material = new THREE.ShaderMaterial( { //给着色器传入uniform变量的值
					uniforms: {
						"map": { type: "t", value: texture },
						"fogColor" : { type: "c", value: fog.color },
						"fogNear" : { type: "f", value: fog.near },
						"fogFar" : { type: "f", value: fog.far },
					},
					vertexShader: document.getElementById( 'cloud-vs' ).textContent,
					fragmentShader: document.getElementById( 'cloud-fs' ).textContent,
					depthWrite: false,
					depthTest: false,
					transparent: true
				} );
				
				mesh = new THREE.Mesh( geometry, material );
				mesh.position.z = - 5000; //
				scene.add( mesh );
				//------------------------------------------------------------------------------

				//导入flamingo模型
				const loader = new GLTFLoader();
				loader.load( 'https://techbrood.com/threejs/examples/models/gltf/Flamingo.glb', function ( gltf ) {
					let mesh = gltf.scene.children[ 0 ];
					const s = 0.35;
					mesh.scale.set( s, s, s );
					mesh.position.y = 15;
					mesh.rotation.y = - 1;
			
					mesh.castShadow = true;
					mesh.receiveShadow = true;
					
					mesh.position.set(0, 50, 0);
					scene.add( mesh );
			
					const mixer = new THREE.AnimationMixer( mesh );
					mixer.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();
					mixers.push( mixer );
			
				} );
			
				//动画渲染
				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );
				renderer.outputEncoding = THREE.sRGBEncoding;
				renderer.shadowMap.enabled = true;
				
				stats = new Stats(); //状态设定
				container.appendChild( stats.dom );
			
				window.addEventListener( 'resize', onWindowResize ); //页面大小事件监听器
				document.addEventListener( 'mousemove', onDocumentMouseMove, false ); //鼠标事件监听器

			}
			function onDocumentMouseMove( event ) {
				mouseX = ( event.clientX - windowHalfX ) * 0.25;
				mouseY = ( event.clientY - windowHalfY ) * 0.15;
			}
			//实时监听页面大小
			function onWindowResize() {	
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}
			
			function animate() {
				requestAnimationFrame( animate );

				var position = ( ( Date.now() - start_time ) * 0.09 ) % 1200;
				camera.position.x += ( mouseX - camera.position.x ) * 0.1;
				camera.position.y += ( - mouseY - camera.position.y ) * 0.1;
				camera.position.z = - position + 1200;

				var delta = clock.getDelta();
				for ( let i = 0; i < mixers.length; i ++ ) {
					mixers[ i ].update( delta );
				}
				renderer.render( scene, camera );
				stats.update(); //更新当前电脑运行状态
			}