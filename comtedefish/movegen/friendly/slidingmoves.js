import {edges} from "../../constants.js"
export default function generateSlidingMoves(homeSquare, directions, position, legalMoves, pinnedPieces) {
    let moveDirections;
    if (pinnedPieces[homeSquare]){
        if (directions.includes(pinnedPieces[homeSquare])){
            moveDirections = [pinnedPieces[homeSquare], -pinnedPieces[homeSquare]];
        } else {
            return;
        }
    } else {
        moveDirections = directions;
    }
    for (let i of moveDirections) {
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
                legalMoves.addMove(homeSquare, currentSquare + i);
                currentSquare += i;
            } else if (position.board[currentSquare + i] & position.moveState.enemy) {
                legalMoves.addMove(homeSquare, currentSquare + i);
                break;
            } else {
                break;
            }
        }
    }
}