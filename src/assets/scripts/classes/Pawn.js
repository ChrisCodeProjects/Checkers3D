import * as THREE from "three";

export default class Pawn extends THREE.Mesh {
  constructor(color, squareId, isW) {
    const geometry = new THREE.CylinderGeometry(3, 3, 2, 32);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      shininess: 100,
      transparent: true,
    });
    super(geometry, material);

    this.isPawn = true;
    this.isQueen = false;
    this.isWhite = isW;
    this.onSquareId = squareId;

    this.castShadow = true;
    this.receiveShadow = true;

    this.basicColor = new THREE.Color(color);
  }
}
