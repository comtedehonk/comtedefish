import {edges} from "../constants.js"
export default function generateKnightMoves(index, position){
    let validMoves;
    let enemy = position.moveState.enemy;
    switch (edges[index]){
        case null:
            validMoves = [index-15, index-6, index+10, index+17, index-17, index+15, index-10, index+6];
            break;
        case 0:
            validMoves = [index-15, index-6, index+10, index+17];
            break;
        case 1:
            validMoves = [index-15, index-6, index+10, index+17, index-17, index+15];
            break;
        case 2:
            validMoves = [index-15, index+17, index-17, index+15, index-10, index+6];
            break;
        case 3:
            validMoves = [index-17, index+15, index-10, index+6];
            break;
    }

    for (let i of validMoves) {
        if (position.board[i] === 0 || (position.board[i] & enemy)){
            legalMoves.addMove(index, i);
        }
    }
}