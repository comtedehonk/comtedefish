import {edges} from "../../constants.js"
export default function generateSlidingMovesInCheck(homeSquare, directions, position, legalMoves, pinnedPieces, blockSquares) {
    let enemy = position.moveState.enemy;
    if (pinnedPieces[homeSquare]){
        return;
    }
    slidingDirections: for (let i of directions) {
        let currentSquare = homeSquare;
        let edge;
        switch (i) {
            case -9:
            case 7:
            case -1:
                edge = 0;
                break;
            case 1:
            case -7:
            case 9:
                edge = 3;
                break;
        }

        while (edges[currentSquare] !== edge) {
            if (position.board[currentSquare + i] === 0) {
                if (blockSquares.holds(currentSquare + i)){
                    legalMoves.addMove(homeSquare, currentSquare + i);
                    continue slidingDirections;
                }            
                currentSquare += i;
            } else if (position.board[currentSquare + i] & enemy) {
                if (blockSquares.holds(currentSquare + i)){
                    legalMoves.addMove(homeSquare, currentSquare + i);
                    return;
                }
                break;
            } else {
                break;
            }
        }
    }
}