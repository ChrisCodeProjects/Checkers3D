import Pawn from "../classes/Pawn";

export function initializePawns(board) {
  const pawns = [];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 8; j++) {
      if ((i + j) % 2 === 1) {
        const blackPawn = new Pawn(0xff4444, 8 * i + j, false);
        blackPawn.position.set(8 * j - 28, 1.01, 8 * i - 28);
        board.squares[i][j].isOccupied = true;
        board.squares[i][j].occupyingPawn = blackPawn;
        pawns.push(blackPawn);
      }
    }
  }

  for (let i = 5; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if ((i + j) % 2 === 1) {
        const whitePawn = new Pawn(0xffffff, 8 * i + j, true);
        whitePawn.position.set(8 * j - 28, 1.01, 8 * i - 28);
        board.squares[i][j].isOccupied = true;
        board.squares[i][j].occupyingPawn = whitePawn;
        pawns.push(whitePawn);
      }
    }
  }

  return pawns;
}
