import * as THREE from 'three';

//

import * as CONFIG from './config.js';
import Road from './road/Road.js';
import CarLights from './car-lights/CarLights.js';
import LightSticks from './light-sticks/Light-Sticks.js';

//

// scene related
let renderer, camera, scene;

// objects
let leftRoadWay, rightRoadWay, island; // road
let leftCarLights, rightCarLights; // car lights
let leftSticks; // light sticks


// animation
let clock;

//

export function init() {

    initScene();
    initObjects();

};

//

function initScene() {

    var sceneConfig = CONFIG.initSceneConfig();

    renderer = new THREE.WebGLRenderer({
        antialias: false
    });

    var container = document.getElementById('app');

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.offsetWidth, container.offsetHeight);

    container.append(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        sceneConfig.fov,
        container.offsetWidth / container.offsetHeight,
        0.1,
        10000
    );

    camera.position.x = 0;
    camera.position.y = 8;
    camera.position.z = -5;

    clock = new THREE.Clock(); 

}

//

function initObjects() {

    // road setup
    var roadConfig = CONFIG.initRoadConfig();

    leftRoadWay = new Road(-1, true, roadConfig);
    rightRoadWay = new Road(1, true, roadConfig);
    island = new Road(0, false, roadConfig);

    scene.add(leftRoadWay, rightRoadWay, island);


    // car lights setup
    var carLightsConfig = CONFIG.initCarLightsConfig();

    leftCarLights = new CarLights(
        carLightsConfig,
        carLightsConfig.colors.leftCars,
        carLightsConfig.movingAwaySpeed,
        new THREE.Vector2(0, 1 - carLightsConfig.carLightsFade)
    );

    leftCarLights.position.setX(
        -roadConfig.roadWidth / 2 - roadConfig.islandWidth / 2
    );
    
    //

    rightCarLights = new CarLights(
        carLightsConfig,
        carLightsConfig.colors.rightCars,
        carLightsConfig.movingCloserSpeed,
        new THREE.Vector2(1, 0 + carLightsConfig.carLightsFade)
    );
    rightCarLights.position.setX(
        roadConfig.roadWidth / 2 + roadConfig.islandWidth / 2
    );

    scene.add(leftCarLights, rightCarLights);


    // left sticks 
    var lightSticksConfig = CONFIG.initLightSticksConfig();

    leftSticks = new LightSticks(lightSticksConfig);
    leftSticks.position.setX(
        -(roadConfig.roadWidth + roadConfig.islandWidth / 2)
    );

    scene.add(leftSticks);

};

//

export function animate() {

    requestAnimationFrame(animate);

    let delta = clock.getDelta();
    
    update(delta);

    renderer.render(scene, camera);

}

//

function update(delta) {

    var speedUpTarget = 0;
    var speedUp = 0;
    var timeOffset = 0;

    let lerpPercentage = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);

    speedUp += lerp(speedUp, speedUpTarget, lerpPercentage, 0.00001);

    timeOffset += speedUp * delta;

    let time = clock.elapsedTime + timeOffset;

    leftRoadWay.update(time);
    rightRoadWay.update(time);
    island.update(time);

    //

    leftCarLights.update(time);
    rightCarLights.update(time);

    //

    leftSticks.update(time);

}

//

function lerp(current, target, speed = 0.1, limit = 0.001) {
    let change = (target - current) * speed;
    if (Math.abs(change) < limit) {
        change = target - current;
    }
    return change;
}

