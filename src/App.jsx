import { useEffect } from "react";

import SceneInit from "./assets/scripts/inits/Sceneinit";
import Board from "./assets/scripts/classes/Board";
import { initializePawns } from "./assets/scripts/inits/PawnsInit";
import MoveManager from "./assets/scripts/moveManagement/MoveManager";

function App() {

  useEffect(() => {
    const init = new SceneInit();
    init.initialize();
    init.animate();

    const board = new Board();
    board.initialize();
    init.scene.add(board.myBoard);

    const pawns = initializePawns(board);
    pawns.forEach(pawn => init.scene.add(pawn));

    const moveManager = new MoveManager(init.scene, init.camera, board.squares);

  }, []);

  return (
    <>
      <canvas id="myThreeJsCanvas"></canvas>
    </>
  );
}

export default App;
