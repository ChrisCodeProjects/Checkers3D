import * as THREE from "three";

export default class Square extends THREE.Mesh {
  constructor(color, id) {
    const geometry = new THREE.PlaneGeometry(8, 8); // Każdy kwadrat ma rozmiar 8x8 jednostek
    const material = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
      shininess: 100,
      transparent: true,
      opacity: 0
    });

    super(geometry, material);

    this.isSquare = true;
    this.squareId = id;
    this.isOccupied = false;
    this.occupyingPawn = null;
    this.defaultColor = new THREE.Color(color);

    this.receiveShadow = false;
    this.castShadow = false;
    this.rotation.x = -Math.PI / 2;
  }
}
