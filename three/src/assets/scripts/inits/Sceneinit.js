import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module.js";

export default class SceneInit {
  constructor() {

    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;

    this.fov = 45;
    this.nearPlane = 1;
    this.farPlane = 1000;
    this.canvasId = "myThreeJsCanvas";

    this.stats = undefined;
    this.controls = undefined;

    this.ambientLight = undefined;
    this.directionalLight = undefined;
  }

  initialize() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.camera.position.z = 80;
    this.camera.position.y = 80;

    const canvas = document.getElementById(this.canvasId);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x456799);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.stats = Stats();
    document.body.appendChild(this.stats.dom);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 4);
    this.directionalLight.castShadow = true;
    this.directionalLight.position.set(96, 64, 0);
    //shadow settings
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 80;
    this.directionalLight.shadow.camera.far = 160;
    this.directionalLight.shadow.camera.left = -32;
    this.directionalLight.shadow.camera.right = 32;
    this.directionalLight.shadow.camera.top = 32;
    this.directionalLight.shadow.camera.bottom = -32;

    this.scene.add(this.directionalLight);

    /*const helper = new THREE.DirectionalLightHelper(this.directionalLight, 5);
    this.scene.add(helper);*/

    window.addEventListener("resize", () => this.onWindowResize(), false);
  }

  animate() {
    window.requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
    this.controls.update();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
