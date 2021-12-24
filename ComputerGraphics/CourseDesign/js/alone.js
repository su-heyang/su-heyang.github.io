//导入three.js的模型和模型相关配置
			import * as THREE from 'https://techbrood.com/threejs/build/three.module.js';
			import Stats from 'https://techbrood.com/threejs/examples/jsm/libs/stats.module.js';
			import { GLTFLoader } from 'https://techbrood.com/threejs/examples/jsm/loaders/GLTFLoader.js';
			import { OrbitControls } from 'https://techbrood.com/threejs/examples/jsm/controls/OrbitControls.js';
			let camera, scene, renderer, controls;
			const mixers = [];
			let stats;
			
			const clock = new THREE.Clock(); //设定时间变量clock用于内容重绘
			//初始化
			init();
			//动画展示
			animate();
			
			function init() {
				//container用于显示网页运行的各个实时状态指标
				const container = document.getElementById( 'container' );
			
				camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 1000 );
				camera.position.set( 10, 10, 250 ); //设置相机的位置
				
				scene = new THREE.Scene(); //创建环境
				scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
				scene.fog = new THREE.Fog( scene.background, 1, 1000 );
				
				//添加环境光
				const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
				hemiLight.color.setHSL( 0.6, 1, 0.6 );
				hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
				hemiLight.position.set( 0, 55, 0 );
				scene.add( hemiLight );
				//添加半球型/户外光源辅助对象
				const hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
				scene.add( hemiLightHelper );

				//添加平行光
				const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
				dirLight.color.setHSL( 0.1, 1, 0.95 );
				dirLight.position.set( - 1, 1.75, 1 );
				dirLight.position.multiplyScalar( 30 );
				scene.add( dirLight );
			
				dirLight.castShadow = true;
				dirLight.shadow.mapSize.width = 2048;
				dirLight.shadow.mapSize.height = 2048;
			
				const d = 50;
			
				dirLight.shadow.camera.left = - d;
				dirLight.shadow.camera.right = d;
				dirLight.shadow.camera.top = d;
				dirLight.shadow.camera.bottom = - d;
			
				dirLight.shadow.camera.far = 3500;
				dirLight.shadow.bias = - 0.0001;
				//添加平行光辅助对象
				const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 10 );
				scene.add( dirLightHelper );
			
				//地面布局
				const groundGeo = new THREE.PlaneGeometry( 150, 150 ); //设置平面大小
				const groundMat = new THREE.MeshLambertMaterial( { color: 0xffffff } );
				groundMat.color.setHSL( 0.095, 1, 0.75 ); //设置平面颜色
				const ground = new THREE.Mesh( groundGeo, groundMat );
				ground.position.y = - 33;
				ground.rotation.x = - Math.PI / 2;
				ground.receiveShadow = true;
				scene.add( ground );
				//设置顶点、片元着色器参数值
				const vertexShader = document.getElementById( 'alone-vs' ).textContent;
				const fragmentShader = document.getElementById( 'alone-fs' ).textContent;
				const uniforms = {
					"topColor": { value: new THREE.Color( 0x0077ff ) },
					"bottomColor": { value: new THREE.Color( 0xffffff ) },
					"offset": { value: 33 },
					"exponent": { value: 0.6 }
				};
				uniforms[ "topColor" ].value.copy( hemiLight.color );
				scene.fog.color.copy( uniforms[ "bottomColor" ].value ); //雾化颜色与地面颜色相同
				
				//天空幕布设置
				const skyGeo = new THREE.SphereGeometry( 300, 32, 15 ); //创建一个球体，参数1为球体的半径，参数2、3为经纬度两个方向的细分数
				const skyMat = new THREE.ShaderMaterial( {
					uniforms: uniforms,
					vertexShader: vertexShader,
					fragmentShader: fragmentShader,
					side: THREE.BackSide
				} );
				const sky = new THREE.Mesh( skyGeo, skyMat );
				scene.add( sky );
			
				//导入flamingo模型
				const loader = new GLTFLoader();
				loader.load( 'https://techbrood.com/threejs/examples/models/gltf/Flamingo.glb', function ( gltf ) {
					const mesh = gltf.scene.children[ 0 ];
					const s = 0.35;
					mesh.scale.set( s, s, s );
					mesh.position.y = 15;
					mesh.rotation.y = - 1;
			
					mesh.castShadow = true;
					mesh.receiveShadow = true;
			
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
				
				// 设置轨道控制器，利用鼠标控制相机沿目标物体旋转
				controls = new OrbitControls( camera, renderer.domElement );
				controls.screenSpacePanning = true;
				controls.minDistance = 1;
				controls.maxDistance = 300;
				controls.target.set( 0, 0, 0 );
				controls.update();
				
				stats = new Stats(); //状态设定
				container.appendChild( stats.dom );
				
				window.addEventListener( 'resize', onWindowResize ); //增加页面大小事件监听器
				const hemisphereButton = document.getElementById( 'hemisphereButton' ); //环境光开关按钮
				hemisphereButton.addEventListener( 'click', function () {
					hemiLight.visible = ! hemiLight.visible;
					hemiLightHelper.visible = ! hemiLightHelper.visible;
				} );
				const directionalButton = document.getElementById( 'directionalButton' ); //平行光开关按钮
				directionalButton.addEventListener( 'click', function () {
					dirLight.visible = ! dirLight.visible;
					dirLightHelper.visible = ! dirLightHelper.visible;
				} );
			}
			//实时监听页面大小
			function onWindowResize() {	
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}
			
			function animate() {
				requestAnimationFrame( animate );
				//动画实现
				render();
				//更新电脑运行状态
				stats.update();
			}
			
			function render() {
				var delta = clock.getDelta();
				for ( let i = 0; i < mixers.length; i ++ ) {
					mixers[ i ].update( delta );
				}
				renderer.render( scene, camera );
			}