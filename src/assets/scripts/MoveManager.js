import * as THREE from "three";
import gsap from "gsap";

export default class MoveManager {
  constructor(scene, camera, squares) {
    this.scene = scene;
    this.camera = camera;
    this.squares = squares;
    this.selectedPawn = null;
    this.selectedPawnSquare = null;
    this.selectedPawnSquareX = null;
    this.selectedPawnSquareY = null;
    this.canMove = true;
    this.hoveredObject = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    window.addEventListener("click", (event) => this.onMouseClick(event));
    window.addEventListener("mousemove", (event) => this.onMouseMove(event));
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersections = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    if (intersections.length > 0) {
      const hoveredObject = intersections[0].object;

      if (this.selectedPawn === null && hoveredObject.isPawn) {
        if (this.hoveredObject !== hoveredObject) {
          this.resetHover();
          this.hoveredObject = hoveredObject;

          gsap.killTweensOf(hoveredObject.material);
          gsap.to(hoveredObject.material, {
            opacity: 0.5,
            duration: 0.2,
          });
        }
      } else {
        this.resetHover();
      }
    } else {
      this.resetHover();
    }
  }

  resetHover() {
    if (this.hoveredObject) {
      gsap.killTweensOf(this.hoveredObject.material);
      gsap.to(this.hoveredObject.material, {
        opacity: 1,
        duration: 0.2,
      });

      this.hoveredObject = null;
    }
  }

  onMouseClick(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersections = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    if (intersections.length > 0 && this.canMove) {
      const selectedObject = intersections[0].object;

      if (selectedObject.isPawn) {
        if (this.selectedPawn === selectedObject) {
          this.clearAvailableMovesHighlight();
          this.resetPawn();
          this.selectedPawn = null;
          this.selectedPawnSquare = null;
          return;
        }

        if (this.selectedPawn) {
          this.clearAvailableMovesHighlight();
          this.resetPawn();
        }

        this.setPawn(selectedObject);

        this.selectedPawn = selectedObject;
        const [pawnSquareY, pawnSquareX] = this.calculateSquarePosition(
          this.selectedPawn.onSquareId
        );
        this.selectedPawnSquareX = pawnSquareX;
        this.selectedPawnSquareY = pawnSquareY;
        this.selectedPawnSquare = this.squares[pawnSquareY][pawnSquareX];

        this.highlightAvailableMoves();
      } else if (selectedObject.isSquare) {
        if (this.selectedPawn === null || selectedObject.isOccupied) return;
        else {
          this.movePawn(selectedObject);
        }
      }
    }
  }

  highlightAvailableMoves() {
    const availableMoves = this.checkAvailableMoves();
    availableMoves.forEach((square) => {
      gsap.to(square.material.color, {
        r: 0.2,
        g: 0.5,
        b: 0.2,
        duration: 0.2,
      });
    });
  }

  clearAvailableMovesHighlight() {
    for (let i = 0; i < this.squares.length; i++) {
      for (let j = 0; j < this.squares[i].length; j++) {
        const square = this.squares[i][j];
        gsap.to(square.material.color, {
          r: square.defaultColor.r,
          g: square.defaultColor.g,
          b: square.defaultColor.b,
          duration: 0.2,
        });
      }
    }
  }

  checkAvailableMoves() {
    const availableMoves = [];

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const square = this.squares[y][x];
        const [deltaX, deltaY] = this.calculateDelta(square);

        if (this.checkMove(square, deltaX, deltaY)) {
          if (!this.selectedPawn.isQueen) {
            if (deltaX === 2 && Math.abs(deltaY) === 2) {
              if (this.checkPawnCapture(square)) {
                availableMoves.push(square);
              }
            } else if (!square.isOccupied) {
              availableMoves.push(square);
            }
          } else if (this.selectedPawn.isQueen) {
            availableMoves.push(square);
          }
        }
      }
    }

    return availableMoves;
  }

  checkMove(square, deltaX, deltaY) {
    if (this.selectedPawn) {
      if (!this.selectedPawn.isQueen) {
        if (
          Math.abs(deltaX) === 1 &&
          ((this.selectedPawn.isWhite && deltaY === -1) ||
            (!this.selectedPawn.isWhite && deltaY === 1))
        ) {
          return true;
        } else if (Math.abs(deltaX) === 2 && Math.abs(deltaY) === 2) {
          if (this.checkPawnCapture(square)) {
            return true;
          }
        } else {
          return false;
        }
      } else if (this.selectedPawn.isQueen) {
        if (Math.abs(deltaX) === Math.abs(deltaY) && !square.isOccupied) {
          if (this.checkQueenMove(square)) return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  checkQueenMove(selectedObject) {
    const [deltaX, deltaY] = this.calculateDelta(selectedObject);
    const [selectedObjectY, selectedObjectX] = this.calculateSquarePosition(
      selectedObject.squareId
    );
    const directionX = deltaX > 0 ? 1 : -1;
    const directionY = deltaY > 0 ? 1 : -1;
    let x = this.selectedPawnSquareX + directionX;
    let y = this.selectedPawnSquareY + directionY;

    let pawns = [];
    let encounteredFriendly = false;

    while (x !== selectedObjectX && y !== selectedObjectY) {
      const square = this.squares[y][x];

      if (square.isOccupied) {
        if (square.occupyingPawn.isWhite !== this.selectedPawn.isWhite) {
          pawns.push(square.occupyingPawn);
        } else {
          encounteredFriendly = true;
        }
      }
      x += directionX;
      y += directionY;
    }

    if (encounteredFriendly) return false;
    else if (pawns.length === 0) return true;
    else if (pawns.length === 1 && !selectedObject.isOccupied) {
      return true;
    } else return false;
  }

  checkPawnCapture(square) {
    const [targetY, targetX] = this.calculateSquarePosition(square.squareId);

    const middleSquareX = (this.selectedPawnSquareX + targetX) / 2;
    const middleSquareY = (this.selectedPawnSquareY + targetY) / 2;
    const middleSquare = this.squares[middleSquareY][middleSquareX];

    if (
      middleSquare.isOccupied &&
      middleSquare.occupyingPawn.isWhite !== this.selectedPawn.isWhite &&
      !square.isOccupied
    ) {
      return true;
    } else return false;
  }

  checkQueenCapture(selectedObject) {
    const [deltaX, deltaY] = this.calculateDelta(selectedObject);
    const [selectedObjectY, selectedObjectX] = this.calculateSquarePosition(
      selectedObject.squareId
    );
    const directionX = deltaX > 0 ? 1 : -1;
    const directionY = deltaY > 0 ? 1 : -1;
    let x = this.selectedPawnSquareX + directionX;
    let y = this.selectedPawnSquareY + directionY;

    let pawns = [];

    while (x !== selectedObjectX && y !== selectedObjectY) {
      const square = this.squares[y][x];

      if (square.isOccupied) {
        if (square.occupyingPawn.isWhite !== this.selectedPawn.isWhite) {
          pawns.push(square.occupyingPawn);
        } else {
          return false;
        }
      }
      x += directionX;
      y += directionY;
    }

    if (pawns.length === 1) {
      return pawns[0];
    }
    return false;
  }

  movePawn(selectedObject) {
    const [deltaX, deltaY] = this.calculateDelta(selectedObject);

    if (this.checkMove(selectedObject, deltaX, deltaY)) {
      if (!this.selectedPawn.isQueen) {
        if (deltaX === 2 && Math.abs(deltaY) === 2) {
          this.capturePawn(selectedObject);
        } else this.executeMove(selectedObject);
      } else if (this.selectedPawn.isQueen) {
        const pawn = this.checkQueenCapture(selectedObject);
        if (pawn) {
          this.capturePawn(selectedObject, pawn);
        } else {
          this.executeMove(selectedObject);
        }
      }
    }
  }

  capturePawn(targetSquare, pawn) {
    const [selectedPawnSquareY, selectedPawnSquareX] =
      this.calculateSquarePosition(this.selectedPawn.onSquareId);

    this.selectedPawnSquareX = selectedPawnSquareX;
    this.selectedPawnSquareY = selectedPawnSquareY;

    this.executeMove(targetSquare);

    const [targetY, targetX] = this.calculateSquarePosition(
      targetSquare.squareId
    );

    let middleSquare;

    if (!this.selectedPawn.isQueen) {
      const middleSquareX = (this.selectedPawnSquareX + targetX) / 2;
      const middleSquareY = (this.selectedPawnSquareY + targetY) / 2;

      middleSquare = this.squares[middleSquareY][middleSquareX];
    } else {
      const [pawnSquareY, pawnSquareX] = this.calculateSquarePosition(
        pawn.onSquareId
      );
      middleSquare = this.squares[pawnSquareY][pawnSquareX];
    }

    if (middleSquare.isOccupied) {
      gsap.to(middleSquare.occupyingPawn.material, {
        opacity: 0,
        duration: 0.25,
      });

      gsap.to(middleSquare.occupyingPawn.position, {
        y: -3,
        duration: 0.5,
        onComplete: () => {
          this.scene.remove(middleSquare.occupyingPawn);
          middleSquare.isOccupied = false;
          middleSquare.occupyingPawn = null;
        },
      });
    }
  }

  executeMove(selectedObject) {
    this.canMove = false;

    selectedObject.isOccupied = true;
    selectedObject.occupyingPawn = this.selectedPawn;

    this.selectedPawn.onSquareId = selectedObject.squareId;

    gsap.to(this.selectedPawn.position, {
      x: selectedObject.position.x,
      y: 4,
      z: selectedObject.position.z,
      duration: 0.5,
    });

    if (this.selectedPawnSquare) {
      this.selectedPawnSquare.isOccupied = false;
      this.selectedPawnSquare.occupyingPawn = null;
    }

    this.clearAvailableMovesHighlight();

    setTimeout(() => {
      this.selectedPawnSquare = null;
      this.canMove = true;

      this.resetPawn();

      const [targetY] = this.calculateSquarePosition(selectedObject.squareId);
      if (
        (this.selectedPawn.isWhite && targetY === 0) ||
        (!this.selectedPawn.isWhite && targetY === 7)
      ) {
        const selectedPawnCopy = this.selectedPawn;
        setTimeout(() => {
          this.promoteToQueen(selectedPawnCopy);
        }, 500);
      }

      this.selectedPawn = null;
    }, 500);
  }

  setPawn(selectedObject) {
    this.resetHover();
    gsap.to(selectedObject.material.color, {
      r: 0.1,
      g: 1,
      b: 0.1,
      duration: 0.2,
    });
    gsap.to(selectedObject.position, { y: 4, duration: 0.5 });
  }

  resetPawn() {
    gsap.to(this.selectedPawn.material.color, {
      r: this.selectedPawn.basicColor.r,
      g: this.selectedPawn.basicColor.g,
      b: this.selectedPawn.basicColor.b,
      duration: 0.5,
    });
    gsap.to(this.selectedPawn.position, { y: 1.05, duration: 0.5 });
  }

  promoteToQueen(pawn) {
    if (pawn.isQueen) return;

    pawn.isQueen = true;
    const queenColor = pawn.isWhite
      ? new THREE.Color(0.3, 0.6, 1)
      : new THREE.Color(1, 0.65, 0.2);
    pawn.basicColor = {
      r: queenColor.r,
      g: queenColor.g,
      b: queenColor.b,
    };

    gsap.to(pawn.material.color, {
      r: queenColor.r,
      g: queenColor.g,
      b: queenColor.b,
      duration: 0.5,
    });
  }

  calculateDelta(square) {
    const [targetY, targetX] = this.calculateSquarePosition(square.squareId);
    const [pawnSquareY, pawnSquareX] = this.calculateSquarePosition(
      this.selectedPawn.onSquareId
    );

    const deltaX = targetX - pawnSquareX;
    const deltaY = targetY - pawnSquareY;

    return [deltaX, deltaY];
  }

  calculateSquarePosition(squareId) {
    const squareX = squareId % 8;
    const squareY = (squareId - squareX) / 8;

    return [squareY, squareX];
  }
}
