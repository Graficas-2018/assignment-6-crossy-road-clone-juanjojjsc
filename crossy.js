var renderer = null,
scene = null,
camera = null,
root = null,
robot_idle = null,
robot_attack = null,
flamingo = null,
stork = null,
group = null,
stepCount = 1;


var rockPath = "images/rock.png";
var metalPath = "images/metal.png";
var waterPath = "images/slime.png";
var bgUrl = "./images/mwh.jpg";

var robot_mixer = {};
var deadAnimator;
var morphs = [];
var boxes = [];
var robotBox = null;



var duration = 20000; // ms
var currentTime = Date.now();

var animation = "idle";

function changeAnimation(animation_text)
{
    animation = animation_text;

    if(animation =="dead")
    {
        createDeadAnimation();
    }
    else
    {
        robot_idle.rotation.x = 0;
        robot_idle.position.y = -4;
    }
}

function loadGround(type,path,z)
{
  console.log("Loading Ground Type: ",type);

  var y = -4;

  if (type == "Rock")
      y = -2;
  if (type == "Metal")
      y = -0;
  if (type == "Water")
      y = -3;


  // Create a texture map
  var map = new THREE.TextureLoader().load(path);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(8, 8);

  // Put in a ground plane to show off the lighting
  //geometry = new THREE.BoxGeometry(100, 30, 5, 50, 50, 50);
  geometry = new THREE.PlaneGeometry(100, 30, 5, 5);
  var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));

  mesh.position.set(0, y, z);
  mesh.rotation.x += Math.PI/2;

  // Add the mesh to our group
  scene.add( mesh );
  mesh.castShadow = false;
  mesh.receiveShadow = true;

  if (type == "Rock")
  {
    var rock_geom = new THREE.BoxGeometry( 2, 2, 2, 5, 5, 5 );
    var material_t = new THREE.MeshBasicMaterial( {color: 0x683000} );
    var rock = new THREE.Mesh( rock_geom, material_t );

    var clone_rock;

    for (var i = 0; i < 17; i++)
    {
        clone_rock = rock.clone();

        posx = Math.floor(Math.random() * 12) + 1;
        posx *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
        posy = Math.floor(Math.random() * 4) + 1;
        posy *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

        clone_rock.position.set(posx, posy, -z);

        var rockBox = new THREE.BoxHelper(clone_rock, 0x00ff00);
        rockBox.update();
        rockBox.visible = false;
        boxes.push(rockBox);

        scene.add(clone_rock);

    }
  }

}

function loadGroundALL()
{

  loadGround("Rock",rockPath,30);
  var count = 0;
  while (count < 999)
  {
      var prob = Math.floor(Math.random() * 100) + 1;

      if (prob > 0 && prob < 60)
      {
          loadGround("Rock",rockPath,-count);
      } else if (prob > 60 && prob < 85)
      {
          loadGround("Metal",metalPath,-count);
      } else {
          loadGround("Water",waterPath,-count);
      }
      count += 30;

    }
}

function loadFBX()
{
    var loader = new THREE.FBXLoader();
    loader.load( './models/Robot/robot_idle.fbx', function ( object )
    {
        robot_mixer["idle"] = new THREE.AnimationMixer( scene );
        object.scale.set(0.02, 0.02, 0.02);
        object.position.y += 0.1;
        object.position.x -= 12;
        object.rotation.y += Math.PI ;
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );
        robot_idle = object;
        console.log("ROBOT CREATED");
        console.log("x: ",robot_idle.position.x);
        console.log("y: ",robot_idle.position.y);
        console.log("z: ",robot_idle.position.z);
        //Collider
        var robotBBox = new THREE.BoxHelper(robot_idle, 0x00ff00);
        robotBBox.update();
        robotBBox.visible = false;
        robotBox = robotBBox;
        scene.add( robot_idle );

        //createDeadAnimation();

        robot_mixer["idle"].clipAction( object.animations[ 0 ], robot_idle ).play();

        loader.load( './models/Robot/robot_atk.fbx', function ( object )
        {
            robot_mixer["attack"] = new THREE.AnimationMixer( scene );
            robot_mixer["attack"].clipAction( object.animations[ 0 ], robot_idle ).play();
        } );

        loader.load( './models/Robot/robot_run.fbx', function ( object )
        {
            robot_mixer["run"] = new THREE.AnimationMixer( scene );
            robot_mixer["run"].clipAction( object.animations[ 0 ], robot_idle ).play();
        } );

        loader.load( './models/Robot/robot_walk.fbx', function ( object )
        {
            robot_mixer["walk"] = new THREE.AnimationMixer( scene );
            robot_mixer["walk"].clipAction( object.animations[ 0 ], robot_idle ).play();
        } );
    } );
}

function animate() {

    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;

    if(robot_idle && robot_mixer[animation])
    {
        robot_mixer[animation].update(deltat * 0.001);
    }

    if(animation =="dead")
    {
        KF.update();
    }

    checkCollisions();


    //var robBox = new THREE.Box3().setFromObject(this.sphereBBox);
    //var cubeBox = new THREE.Box3().setFromObject(this.cubeBBox);

    //if (robBox.intersectsBox(cubeBox))


}

function checkCollisions(){
  //robotBox.update();
  var robotBBox = new THREE.Box3().setFromObject(robotBox);
  for(let box of boxes){
    //box.update();
    if(robotBox.intersectsBox(new THREE.Box3().setFromObject(box)))
    collision();
  }
}

function collision() {
    console.log("Collision");
}

function run() {
    requestAnimationFrame(function() { run(); });

        // Render the scene
        renderer.render( scene, camera );

        // Spin the cube for next frame
        animate();

        // Update the camera controller
        //orbitControls.update();
}

function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;

    light.color.setRGB(r, g, b);
}


var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "./images/checker_large.gif";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {

    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Create a new Three.js scene
    scene = new THREE.Scene();
    // Background image
    var backgroundImg = new THREE.TextureLoader().load(bgUrl);
    backgroundImg.wrapS = backgroundImg.wrapT = THREE.RepeatWrapping;
    backgroundImg.repeat.set(1, 1);
    scene.background = backgroundImg

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(-15, 16, 60);
    scene.add(camera);

    //orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    // Create a group to hold all the objects
    root = new THREE.Object3D;

    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(-30, 100, -10);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;

    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0xffffff );
    root.add(ambientLight);

    // Create the objects
    loadFBX();

    //Load Ground
    // loadRock(30);
    // loadRock(0);
    // loadRock(-30);

    loadGroundALL();

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    var color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;

    // Add the mesh to our group
    group.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;

    // Now add the group to our scene
    scene.add( root );

    document.addEventListener('keydown', onDocumentKeyDown);
}

function onDocumentKeyDown(event)
{
    var keyCode = event.which;

    if (keyCode == 38)
    {
        // Forward
        console.log("x: ",robot_idle.position.x);
        console.log("y: ",robot_idle.position.y);
        console.log("z: ",robot_idle.position.z);

        robot_idle.position.z -= 10;
        // console.log(robot_idle.rotation.y);
        if (robot_idle.rotation.y > 0 && robot_idle.rotation.y < 3)
            robot_idle.rotation.y += Math.PI / 2;
        else if(robot_idle.rotation.y < 0)
            robot_idle.rotation.y -= Math.PI / 2;

        if (stepCount == 3)
        {
            camera.position.z -= 30;
            stepCount = 0;
        }
        stepCount += 1;

    }
    else if (keyCode == 37)
    {
        // Left
        robot_idle.position.x -= 10;
        robot_idle.rotation.y = -Math.PI / 2;
    }
    else if (keyCode == 39)
    {
        // Right
        robot_idle.position.x += 10;
        robot_idle.rotation.y = Math.PI / 2;
    }
}
