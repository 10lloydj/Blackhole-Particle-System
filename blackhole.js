var createScene = function () {
  //--------------------------------Scene---------------------------------//  

    var scene = new BABYLON.Scene(engine);
    // black background
    scene.clearColor = new BABYLON.Color3(0.0, 0.0, 0.0);

    // archrotatecamera to lock onto the blackhole
    var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 8, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    // creates a light aiming straight up
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Reduced the strengh of the light
    light.intensity = 0.4;

//--------------------------Background of Planets-------------------------//
    
    // source:https://playground.babylonjs.com/#N74LDU#6
    // creates a galaxy feel
    // changed the star sizes
    var numStars = 100000;
    var boxSize = 1500;
    // change image
    var spriteManagerStars = new BABYLON.SpriteManager('starsManager', 'http://i.imgur.com/FD4kD0t.png', numStars, 500, scene);
    for (var i = 0; i < numStars; i++) {
        var star = new BABYLON.Sprite('star' + i, spriteManagerStars);
        star.position.x = Math.random() * boxSize - boxSize / 2;
        star.position.y = Math.random() * boxSize - boxSize / 2;
        star.position.z = Math.random() * boxSize - boxSize / 2;
        star.size = 0.3;
    } // for

//--------------------------Blackhole--------------------------------------//

    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2.01, segments: 64}, scene);
    sphere.position.y = 1;

    //Create blackhole material
    var bhMat = new BABYLON.StandardMaterial("bhMat", scene);
    // adds an element of depth to the sphere
    bhMat.bumpTexture = new BABYLON.Texture("textures/grass.png", scene);
	//bhMat.ambientTexture = new BABYLON.Texture("textures/grass.png", scene);
    // diffuse lighting spreads light and colour
	bhMat.diffuseColor = new BABYLON.Color3(0.33, 0.21, 1);
    // level of depth to texture
    bhMat.bumpTexture.level = 0.9;
    bhMat.alpha = 1;
    sphere.material = bhMat;

    // GPU particle system source
    var centre = BABYLON.Mesh.CreateBox("centre", 0.2, scene);
    // invisible
    centre.visibility = 0;
    centre.position.y = 1;
//----------------------------Orbiting Ring--------------------------------//
    // disc emits the particles of the ring    
    var  orbit = BABYLON.MeshBuilder.CreateDisc("orbit", scene);
    // rotate Pi/2(90 degrees)
    orbit.rotation.x = 3.14159/2;
    // invisible mesh
    orbit.isVisible = false;
//------------------------------------Particle Systems---------------------//
    // mist & ring particle systems
    var mist = new BABYLON.ParticleSystem("mist", 600, scene);
    var ring = new BABYLON.ParticleSystem("ring", 8000, scene);

    // particle textures
    mist.particleTexture = new BABYLON.Texture("https://raw.githubusercontent.com/PatrickRyanMS/BabylonJStextures/master/ParticleSystems/Sun/T_Star.png", scene);
    // babylon texture
    ring.particleTexture = new BABYLON.Texture("/textures/flare.png", scene);
    
    // origin of particles
    // emitter object properties
    var mistType = new BABYLON.SphereParticleEmitter();
    var ringType = new BABYLON.SphereParticleEmitter();
    ringType.radius=0.4
    mistType.radius = 1;
    mistType.radiusRange = 0.0;    
    mist.emitter = sphere; 
    mist.particleEmitterType = mistType;
    ring.emitter = orbit;
    ring.particleEmitterType = ringType;

    // colour particle gradients  
    // purply white
    mist.addColorGradient(0, new BABYLON.Color4(0.61, 0.49, 0.93, 0));
    mist.addColorGradient(0.5, new BABYLON.Color4(0.29, 0.39, 0.97, 0.12));
    mist.addColorGradient(1.0, new BABYLON.Color4(0.64, 0.64, 0.99, 0));    
   
    ring.addColorGradient(0, new BABYLON.Color4(0.61, 0.49, 0.93, .4));
    ring.addColorGradient(0.5, new BABYLON.Color4(0.64, 0.64, 0.99, .4));
    ring.addColorGradient(1.0, new BABYLON.Color4(0.15, 0.15, 0.89, .3));    

    ring.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // particle size
    ring.minSize = 0.03;
    ring.maxSize = 0.2;
    // particle life time
    mist.minLifeTime = 2.0;
    mist.maxLifeTime= 2.0;
    ring.minLifeTime = 2.0;
    ring.maxLifeTime = 2.0;
    // emission rate
    mist.emitRate = 300;
    ring.emitRate = 1000;

    ring.gravity = new BABYLON.Vector3(0, 0, 0);

    // how large the particle cloud is
    mist.maxScaleY = 1;
    mist.maxScaleX = 1;    
    mist.minScaleY = 0.75;
    mist.minScaleX = 0.5;

    ring.maxScaleX = 1;
    ring.maxScaleY = 0.75;
    ring.minScaleX = 0.5;
    ring.minScaleY = 0.75;


    //rotates the particles, radians
    // creates the circular effect at the centre of the blackhole
    mist.minAngularSpeed = 0.0;
    mist.maxAngularSpeed = 2.0;

    // power: how large the cloud expands
    // changes on button click to pulsate
    mist.minEmitPower = 0.0;
    mist.maxEmitPower = 0.0;
    ring.minEmitPower = 0.0;
    ring.maxEmitPower = 0.0;

    // isBillboard
    mist.isBillboardBased = true;    
    ring.isBillboardBased = true;

    // blend mode ?? unsure what it does
    mist.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    // gravity
    mist.gravity = new BABYLON.Vector3(0, 0, 0);
    
    // starts the particle sytem before running the scene
    // doesnt have the desired effect for the ring particle
    mist.preWarmStepOffset = 10;
    mist.preWarmCycles = 100;

//----------------------------------------On-click additions------------------------//

    //GPU system (black hole implosion)
    var implosion = new BABYLON.GPUParticleSystem("implosion", {capacity:100000}, scene);
    implosion.activeParticleCount = 100000;
    implosion.color1 =new BABYLON.Color4(0.52, 0.23, 0.98);
    var impType = new BABYLON.CustomParticleEmitter();

    implosion.particleEmitterType = impType;
    // suppose to be item at centre, create if needed
    implosion.emitter = centre;

    implosion.particleTexture = new BABYLON.Texture("/textures/flare.png", scene);
    implosion.maxLifeTime = 10;
    implosion.minSize = 0.01;
    implosion.maxSize = 0.1;
    implosion.emitRate= 10000;
//-----------------------------------------On-click--------------------------------//
    
    // particles are drawn into the centre of the sphere
    impType.particleDestinationGenerator = (index, particle, out) => {
        out.x = 0.0;
        out.y = 1;
        out.z = 0.0;
}
    var source = 0.0;
    impType.particlePositionGenerator = (index, particle, out) => {
        // the value 3 affects the size of the overall thing
        out.x = Math.cos(source) * 1.7;
        out.y = Math.sin(source) * 1.7;
        out.z = 0.0;
        source += 0.9;
    }
    var imploded = false;
    // on enter key the sphere either implodes or stops imploding using boolean
    scene.onKeyboardObservable.add((press) => {
        switch (press.type) {
            case BABYLON.KeyboardEventTypes.KEYDOWN:
                if (press.event.key === "Enter") {

                    if(imploded){
                        implosion.stop();
                        imploded= false;
                        mist.maxEmitPower = 0.0;
                        mist.maxScaleX = 1;
                        mist.maxScaleY = 1;
                        mist.emitRate = 300;
                    } // if
                    else{
                        implosion.start();
                        imploded= true;
                        mist.maxEmitPower = 0.5;
                        mist.maxScaleX = 3.0;
                        mist.maxScaleY = 3.0;
                        mist.emitRate = 700;
                    } // else 
                } // if
                // every space bar press, the gpu rotates faster
                // press 6x is a cool effect
                if (press.event.key === " ") {
                    scene.registerBeforeRender(function() {
                        centre.rotation.x += 0.2;
                        centre.rotation.y += 0.2;
                    }); 
                } // if
       } // switch
    }); 
 //--------------------------------------rendering-------------------------------//
    scene.registerBeforeRender(function() {
        sphere.rotation.y += 0.01;
    });
    var x = 0.0;
    scene.beforeRender = function () {
        // creates the orbiting effect
        orbit.position = new BABYLON.Vector3(1.3 * Math.cos(x), 1.1, 1.3 * Math.sin(x));
        x += 2.15;
    };
    // starts the particle systems
    mist.start();
    ring.start();
    return scene;
};
