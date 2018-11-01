var renderer = null,
scene = null,
camera = null,
root = null,
robotPlayer = null,
robot_attack = null,
flamingo = null,
stork = null,
group = null,
stepCount = 1;
var robotBBox = null;
var morphs = [];
var missile = null;
var orbitControls = null;
var onWater = false;
var onPlatform = false;


var rockPath = "images/rock.png";
var metalPath = "images/metal.png";
var waterPath = "images/slime.png";
var bgUrl = "./images/mwh.jpg";
var dangerUrl = "./images/danger.png";
var platformUrl = "./images/platform.png";

var scoreL = null;
var healthL = null;

var robot_mixer = {};
var deadAnimator;
var morphs = [];
var boxes = [];
var tankBoxes = [];
var platColliders = [];
var waterColliders = [];
var robotBox = null;
var tiles = [];
var scoreCount = 0;
var health = 1000;
var damage = 1;
var facingLeft = false;
var facingRight = false;



var duration = 20000; // ms
var currentTime = Date.now();

var animation = "idle";

function changeAnimation(animation_text)
{
    animation = animation_text;

    if(animation =="dead")
    {
        //createDeadAnimation();
    }
    else
    {
        robotPlayer.rotation.x = 0;
        robotPlayer.position.y = -4;
    }
}


function cloneMesh(mesh,z,collider)
{
  var clone_mesh;

  clone_mesh = mesh.clone();
  clone_mesh.position.set(0, -4, z);
  clone_mesh.rotation.x += Math.PI/2;
  if (collider)
  {
    var cloneBBox = new THREE.BoxHelper(clone_mesh, 0x00ff00);
    cloneBBox.update();
    cloneBBox.visible = false;
    waterColliders.push(cloneBBox);
    scene.add(cloneBBox);
  }

  scene.add(clone_mesh);

}

function cloneMeshWithCollider(mesh,z)
{
  var clone_mesh;

  clone_mesh = mesh.clone();
  clone_mesh.position.set(0, -4, z);
  clone_mesh.rotation.x += Math.PI/2;
  //Collider
  var cloneBBox = new THREE.BoxHelper(clone_mesh, 0x00ff00);
  cloneBBox.update();
  cloneBBox.visible = false;
  boxes.push(cloneBBox);
  scene.add(cloneBBox);
  scene.add(clone_mesh);
}

function createMovingObstacle(z)
{
      // var loader = new THREE.GLTFLoader();
      // loader.load( "./models/Horse.glb", function( gltf ) {
      //     missile = gltf.scene.children[ 0 ];
      //     missile.scale.set( 0.1, 0.1, 0.1 );
      //     missile.position.y -= 10;
      //     missile.position.z = z;
      //     missile.castShadow = true;
      //     missile. receiveShadow = true;
      //     scene.add( missile );
      //     morphs.push(missile);
      //     //mixer.clipAction( gltf.animations[ 0 ], horse).setDuration( 0.5 ).play();
      //     //console.log(gltf.animations);
      // } );

      var loader = new THREE.FBXLoader();
      loader.load( './models/rover/rover.fbx', function ( object )
      {
          robot_mixer["idle"] = new THREE.AnimationMixer( scene );
          object.scale.set(0.2, 0.2, 0.2);
          object.position.y -= 4.2;
          object.position.x -= 12;
          object.position.z = z;
          object.rotation.y += Math.PI;
          object.rotation.x += Math.PI/2;
          object.rotation.z += Math.PI;
          object.traverse( function ( child ) {
              if ( child.isMesh ) {
                  child.castShadow = true;
                  child.receiveShadow = true;
              }
          } );
          tank = object;
          console.log("TANK CREATED");

          //Collider
          tankBBox = new THREE.BoxHelper(tank, 0x00ff00);
          tankBBox.update();
          //tankBBox.position.x = 100;
          //tankBBox.setFromCenterAndSize(tank,(20,20,20));
          tankBBox.visible = false;
          boxes.push(tankBBox);
          tankBoxes.push(tankBBox);
          scene.add(tankBBox);
          scene.add( tank );
          morphs.push(tank);

      } );
}


function createObstacles(z)
{
  var rock_geom = new THREE.BoxGeometry( 4, 4, 4, 5, 5, 5 );
  var map = new THREE.TextureLoader().load(dangerUrl);
  var material_t = new THREE.MeshPhongMaterial({color:0xffffff,
      map:map,
      transparent:true});
  var rock = new THREE.Mesh( rock_geom, material_t );

  var clone_rock;

  for (var i = 0; i < 2; i++)
  {
      clone_rock = rock.clone();

      var posx = Math.floor(Math.random() * 30) + 1;
      posx *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
      var posy = Math.floor(Math.random() * 12) + 4;

      clone_rock.position.set(posx, posy, z);

      var rockBox = new THREE.BoxHelper(clone_rock, 0x00ff00);
      rockBox.update();
      rockBox.visible = false;
      boxes.push(rockBox);

      scene.add(clone_rock);

  }
}

function createPlatform(z)
{
    // Create a texture map
    var map = new THREE.TextureLoader().load(platformUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(3, 3);

    // Put in a ground plane to show off the lighting
    //geometry = new THREE.BoxGeometry(100, 30, 5, 50, 50, 50);
    geometry = new THREE.PlaneGeometry(120, 30, 5, 5);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.BackSide}));

    mesh.position.set(0, -4, z);
    mesh.rotation.x += Math.PI/2;

    //Collider
    var platBBox = new THREE.BoxHelper(mesh, 0x00ff00);
    platBBox.update();
    platBBox.visible = false;
    platColliders.push(platBBox);
    scene.add(platBBox);

    // Add the mesh to our group
    scene.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    morphs.push(mesh);
}

function loadGround(type,path,z)
{
  console.log("Loading Ground Type: ",type);

  var y = -4;

  // Create a texture map
  var map = new THREE.TextureLoader().load(path);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(1, 1);

  // Put in a ground plane to show off the lighting
  //geometry = new THREE.BoxGeometry(100, 30, 5, 50, 50, 50);
  geometry = new THREE.PlaneGeometry(250, 30, 5, 5);
  var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));

  mesh.position.set(0, y, z);
  mesh.rotation.x += Math.PI/2;

  // Add the mesh to our group
  scene.add( mesh );
  mesh.castShadow = false;
  mesh.receiveShadow = true;

}

function loadGroundALL()
{


  //Create the 3 meshes
  //METAL MESH
  //var y = -4;
  // Create a texture map
  var map = new THREE.TextureLoader().load(metalPath);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(1, 1);
  // Put in a ground plane to show off the lighting
  //geometry = new THREE.BoxGeometry(100, 30, 5, 50, 50, 50);
  geometry = new THREE.PlaneGeometry(250, 30, 5, 5);
  var metalMesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.BackSide}));

  //ROCK MESH
  map = new THREE.TextureLoader().load(rockPath);
  //map.wrapS = map.wrapT = THREE.RepeatWrapping;
  //map.repeat.set(1, 1);
  var rockMesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.BackSide}));

  //WATER MESH
  map = new THREE.TextureLoader().load(waterPath);
  //map.wrapS = map.wrapT = THREE.RepeatWrapping;
  //map.repeat.set(1, 1);
  var waterMesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.BackSide}));

  loadGround("Metal",metalPath,90);
  loadGround("Metal",metalPath,60);
  loadGround("Metal",metalPath,30);
  var count = 0;
  while (count < 999)
  {
      var prob = Math.floor(Math.random() * 100) + 1;

      if (prob > 0 && prob < 60)
      {
          tiles.push(0);
          //loadGround("Rock",rockPath,-count);
      } else if (prob > 60 && prob < 85)
      {
          tiles.push(1);
          //loadGround("Metal",metalPath,-count);
      } else {
          tiles.push(2);
          //loadGround("Water",waterPath,-count);
      }
      count += 30;

    }
    var i = 0;
    count = 0;

    for (var i=0; i<tiles.length; i++)
    {

        if (tiles[i]==0)
        {
            cloneMesh(rockMesh,-count);
            createObstacles(-count);
        }

        if (tiles[i]==1)
        {
            cloneMesh(metalMesh,-count);
            createMovingObstacle(-count);
        }

        if (tiles[i]==2)
        {
            cloneMesh(waterMesh,-count,true);
            createPlatform(-count);
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
        object.position.y -= 4.2;
        object.position.x -= 12;
        object.position.z += 30;
        object.rotation.y += Math.PI;
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );
        robotPlayer = object;
        console.log("ROBOT CREATED");
        console.log("x: ",robotPlayer.position.x);
        console.log("y: ",robotPlayer.position.y);
        console.log("z: ",robotPlayer.position.z);
        //Collider
        robotBBox = new THREE.BoxHelper(robotPlayer, 0x00ff00);
        robotBBox.update();
        robotBBox.visible = false;
        robotBox = robotBBox;
        scene.add(robotBBox);
        scene.add( robotPlayer );
        //morphs.push(robotPlayer);

        //createDeadAnimation();

        robot_mixer["idle"].clipAction( object.animations[ 0 ], robotPlayer ).play();

        loader.load( './models/Robot/robot_atk.fbx', function ( object )
        {
            robot_mixer["attack"] = new THREE.AnimationMixer( scene );
            robot_mixer["attack"].clipAction( object.animations[ 0 ], robotPlayer ).play();
        } );

        loader.load( './models/Robot/robot_run.fbx', function ( object )
        {
            robot_mixer["run"] = new THREE.AnimationMixer( scene );
            robot_mixer["run"].clipAction( object.animations[ 0 ], robotPlayer ).play();
        } );

        loader.load( './models/Robot/robot_walk.fbx', function ( object )
        {
            robot_mixer["walk"] = new THREE.AnimationMixer( scene );
            robot_mixer["walk"].clipAction( object.animations[ 0 ], robotPlayer ).play();
        } );
    } );
}

function animate() {

    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;


    if (health < 1)
    {
      //alert("GAME OVER. Score: " + scoreCount);
      // var to_remove = [];
      //
      // scene.traverse ( function( child ) {
      //     if ( child instanceof THREE.Mesh === true ) {
      //         to_remove.push( child );
      //       }
      //   } );
      //
      //   for ( var i = 0; i < to_remove.length; i++ ) {
      //     scene.remove( to_remove[i] );
      //   }
      location.reload();
    }


    if (robotBBox != null)
      robotBBox.update();

    for (let tBox of tankBoxes)
    {
      if (tBox != null)
        tBox.update();
    }

    for (let platB of platColliders)
    {
      if (platB != null)
        platB.update();
    }



    if(robotPlayer && robot_mixer[animation])
    {
        robot_mixer[animation].update(deltat * 0.001);
    }

    if(animation =="dead")
    {
        KF.update();
    }

    if (robotBox != null)
      checkCollisions();



    //Tank Movement and parallax
    for(var morph of morphs)
    {
        morph.position.x += 0.045 * deltat;
        if(morph.position.x > 100)
            morph.position.x = -100 - Math.random() * 50;
    }


}

function checkCollisions(){
  var robotBBox = new THREE.Box3().setFromObject(robotBox);
  for(let box of boxes){
    if(robotBBox.intersectsBox(new THREE.Box3().setFromObject(box)))
    collision();
  }
  for(let wc of waterColliders){

      if (robotBBox.intersectsBox(new THREE.Box3().setFromObject(wc)))
      {
          console.log("WATER");
          onPlatform = false;
          onWater = true;

      }
      // for(let plat of platColliders){
      //     // if(robotBBox.intersectsBox(new THREE.Box3().setFromObject(wc)) && !robotBBox.intersectsBox(new THREE.Box3().setFromObject(plat)) )
      //     // {
      //     //     waterDamage();
      //     // }
      //     if (robotBBox.intersectsBox(new THREE.Box3().setFromObject(wc)))
      //     {
      //         console.log("WATER");
      //     }
      //
      //     if (!robotBBox.intersectsBox(new THREE.Box3().setFromObject(plat)))
      //     {
      //         console.log("PLATFORM");
      //     }
      // }
  }


  //   if(robotBBox.intersectsBox(new THREE.Box3().setFromObject(wc)))
  //   {
  //       waterDamage();
  //
  //   }
  //
  //   for(let plat of platColliders){
  //     if(!robotBBox.intersectsBox(new THREE.Box3().setFromObject(plat)))
  //     {
  //         //waterDamage();
  //         console.log("NO PLATFORM");
  //     }
  //   }
  //
  // }
  for(let plat of platColliders){
    if(robotBBox.intersectsBox(new THREE.Box3().setFromObject(plat)))
    {
        //waterDamage();
        console.log("PLATFORM");
        onWater = false;
        onPlatform = true;
        // robotPlayer.position.z -= 30;
        // camera.position.z -= 30;
    }
  }

  if (onWater == true && onPlatform == false)
        waterDamage();



}

function waterDamage()
{
    console.log("Water Damage");
    changeAnimation("attack");
    damage += 1e-10;
    //damage *= 0.5;
    health -= damage;
    healthL = $("#health");
    healthL.text("Health: " + Math.round(health));
}

function collision() {
    console.log("Collision");
    changeAnimation("attack");
    robotPlayer.position.z += 30;
    camera.position.z += 30;
    health -= 50;
    healthL = $("#health");
    healthL.text("Health: " + health);
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
//var mapUrl = "./images/checker_large.gif";

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
    camera.position.set(-15, 16, 90);
    scene.add(camera);

    //orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    // Create a group to hold all the objects
    root = new THREE.Object3D;

    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(-30, 100, -10);
    spotLight.target.position.set(-2, 0, -2);


    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;

    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0xffffff );
    camera.add(ambientLight);
    camera.add(spotLight);

    // Create the objects
    loadFBX();

    //Load Ground
    // loadRock(30);
    // loadRock(0);
    // loadRock(-30);

    loadGroundALL();

    // Create a group to hold the objects
    //group = new THREE.Object3D;
    //root.add(group);

    // Create a texture map
    // var map = new THREE.TextureLoader().load(mapUrl);
    // map.wrapS = map.wrapT = THREE.RepeatWrapping;
    // map.repeat.set(8, 8);
    //
    // var color = 0xffffff;
    //
    // // Put in a ground plane to show off the lighting
    // geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    // var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));
    //
    // mesh.rotation.x = -Math.PI / 2;
    // mesh.position.y = -4.02;

    // Add the mesh to our group
    //group.add( mesh );
    //mesh.castShadow = false;
    //mesh.receiveShadow = true;

    // Now add the group to our scene
    scene.add( root );

    document.addEventListener('keydown', onDocumentKeyDown);
}

function onDocumentKeyDown(event)
{
    var keyCode = null;

    if (robotPlayer)
         keyCode = event.which;

    if (keyCode == 38 || keyCode == 87)
    {
        // Forward
        changeAnimation("run");
        console.log("x: ",robotPlayer.position.x);
        console.log("y: ",robotPlayer.position.y);
        console.log("z: ",robotPlayer.position.z);


        scoreCount += 10;
        scoreL = $("#score");
        scoreL.text("Score: " + scoreCount);

        robotPlayer.position.z -= 10;
        // console.log(robotPlayer.rotation.y);
        // if (robotPlayer.rotation.y > 0 && robotPlayer.rotation.y < 3)
        //     robotPlayer.rotation.y += Math.PI / 2;
        // else if(robotPlayer.rotation.y < 0)
        //     robotPlayer.rotation.y -= Math.PI / 2;

        if (facingLeft)
        {
            robotPlayer.rotation.y -= Math.PI / 2;
            facingLeft = false;
            facingRight = false;
        }
        if (facingRight)
        {
            robotPlayer.rotation.y += Math.PI / 2;
            facingLeft = false;
            facingRight = false;
        }

        if (stepCount == 3)
        {
            camera.position.z -= 30;
            spotLight.position.z -= 30;
            stepCount = 0;
        }
        stepCount += 1;

    }
    else if (keyCode == 37 || keyCode == 65)
    {
        // Left
        changeAnimation("walk");
        robotPlayer.position.x -= 10;
        robotPlayer.rotation.y = -Math.PI / 2;
        facingLeft = true;
        facingRight = false;
    }
    else if (keyCode == 39 || keyCode == 68)
    {
        // Right
        changeAnimation("walk");
        robotPlayer.position.x += 10;
        robotPlayer.rotation.y = Math.PI / 2;
        facingLeft = false;
        facingRight = true;
    }
    else if (keyCode == 83 || keyCode == 40)
    {
        // Down
        changeAnimation("idle");
        if (facingLeft)
        {
            robotPlayer.rotation.y -= Math.PI / 2;
        }
        if (facingRight)
        {
            robotPlayer.rotation.y += Math.PI / 2;
        }
        facingLeft = false;
        facingRight = false;
    }
}
