import * as THREE from 'three';

import Square from "./Square";

export default class Board {

    constructor(){

        this.myBoard = new THREE.Group();
        this.squares = [];
        
    }

    initialize(){
        const black = "#000";
        const white = "#ddd";
        let color = white;
        for (let i = 0; i < 8; i++){
            this.squares[i] = [];
            for (let j = 0; j < 8; j++){
                let square = new Square(color,(i*8) + j);
                square.position.set((8*j)-28, 0, (8*i)-28);
                this.squares[i][j] = square;
                this.myBoard.add(square);
                (color === black ? color = white : color = black);
            }
            color = (color === black) ? white : black;

            const bottom = new THREE.Mesh(new THREE.BoxGeometry(64, 3, 64), new THREE.MeshPhongMaterial({ color: "#666666", shininess: 100}));
            bottom.position.y = -1.6;
            this.myBoard.add(bottom);
        }
    }
};