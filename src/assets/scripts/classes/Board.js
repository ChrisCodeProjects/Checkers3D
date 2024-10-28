import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const modelPath = new URL('/models/board/checker_board.gltf', import.meta.url).href;
import Square from "./Square";

export default class Board {
    constructor() {
        this.myBoard = new THREE.Group();
        this.squares = [];
    }

    initialize() {
        const black = "#000";
        const white = "#ddd";
        let color = white;

        for (let i = 0; i < 8; i++) {
            this.squares[i] = [];
            for (let j = 0; j < 8; j++) {
                let square = new Square(color, (i * 8) + j);
                square.position.set((8 * j) - 28, 0, (8 * i) - 28);
                this.squares[i][j] = square;
                this.myBoard.add(square);
                color = (color === black) ? white : black;
            }
            color = (color === black) ? white : black;
        }

        const loader = new GLTFLoader();
        loader.load(
            modelPath,
            (gltf) => {
                gltf.scene.scale.set(3.265, 2, 3.265);
                gltf.scene.position.set(0, -2.01, 0);

                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;  // Obiekt rzuca cień
                        child.receiveShadow = true; // Obiekt odbiera cień
                    }
                });
                this.myBoard.add(gltf.scene);
            },
            undefined,
            (error) => {
                console.error('An error happened:', error);
            }
        );
    }
};
