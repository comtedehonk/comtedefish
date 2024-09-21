import {edges} from "../../constants.js"
export default function generatePawnMovesInCheck(index, position, pinnedPieces, legalMoves, blockSquares, friend, enemy){

    if (pinnedPieces[index]){ 
        return;
    }    
    
    let pawnMoves = position.moveState.pawnMoves.map(function(value){
        return value + index;
    });


    if (blockSquares.holds(pawnMoves[3])){
        if (edges[index] !== 0 && ((position.board[pawnMoves[3]]) & enemy)){
            legalMoves.addPawnMove(index, pawnMoves[3], friend);
        }
    } else if (blockSquares.holds(pawnMoves[2])){
        if (edges[index] !== 3 && ((position.board[pawnMoves[2]]) & enemy)){
            legalMoves.addPawnMove(index, pawnMoves[2], friend);
        }
    } 

    if (blockSquares.holds(pawnMoves[0])){
        if (position.board[pawnMoves[0]] === 0){
            legalMoves.addPawnMove(index, pawnMoves[0], friend);
        }
    }

    if (blockSquares.holds(pawnMoves[1])){
        if (position.board[pawnMoves[0]] === 0 && position.board[pawnMoves[1]] === 0 && position.moveState.onSecondRank(index)){
            legalMoves.addMove(index, pawnMoves[1]);
        }
    }    
}