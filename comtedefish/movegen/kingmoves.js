import {edges} from "../constants.js"
export default function generateKingMoves(index, position, legalMoves, oppControlledSquares, enemy){
    let validMoves;
    if (edges[index] === 0){
        validMoves = [index-8, index-7, index+1, index+9, index+8];
    } else if (edges[index] === 3){
        validMoves = [index-9, index-8, index+7, index+8, index-1];
    } else {
        validMoves = [index-9, index-8, index+7, index+8, index-1, index-7, index+9];
    }
    for (let j of validMoves){
        if ((position.board[j] === 0 || position.board[j] & enemy) && !oppControlledSquares.holds(j)){
            legalMoves.addMove(index, j);
        }
    }
}