import { useEffect, useState } from "react";
import * as THREE from "three";

import SceneInit from "./assets/scripts/inits/Sceneinit";
import Board from "./assets/scripts/classes/Board";
import { initializePawns } from "./assets/scripts/inits/PawnsInit";
import MoveManager from "./assets/scripts/MoveManager";

function App() {
  const [player, setPlayer] = useState("White");
 

  useEffect(() => {
    const init = new SceneInit();
    init.initialize();
    init.animate();

    const board = new Board();
    board.initialize();
    init.scene.add(board.myBoard);

    const pawns = initializePawns(board);
    pawns.forEach(pawn => init.scene.add(pawn));

    const moveManager = new MoveManager(init.scene, init.camera, board.squares, setPlayer);

  }, []);

  return (
    <>
      <canvas id="myThreeJsCanvas"></canvas>
      <div id="turnIndicator" className="absolute text-white w-fit top-[10%] left-1/2 translate-x-[-50%] text-center font-semibold text-3xl bg-black p-4 rounded-3xl transition-all z-1">
        {player} to move
      </div>
    </>
  );
}

export default App;
