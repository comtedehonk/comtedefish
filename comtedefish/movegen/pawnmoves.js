import {edges} from "../constants.js"
export default function generatePawnMoves(index, position, pinnedPieces, legalMoves){
    let pawnMoves = position.moveState.pawnMoves;
    let friend = position.moveState.friend;
    let enemy = position.moveState.enemy;
    if (pinnedPieces[index]){ 

        let direction = (friend === 2) ? Math.abs(pinnedPieces[index]) : -Math.abs(pinnedPieces[index]);
        switch (direction){
            case pawnMoves[0]:
                if (position.board[index + pawnMoves[0]] === 0){
                    legalMoves.addPawnMove(index, index + pawnMoves[0], friend)
                    if (position.board[index + pawnMoves[1]] === 0 && position.moveState.onSecondRank(index)){
                        legalMoves.addMove(index, index + pawnMoves[1]);
                    }
                }
                break;
            case pawnMoves[2]:
                if (edges[index] !== 3){
                    if (position.board[index + pawnMoves[2]] & enemy){
                        legalMoves.addPawnMove(index, index + pawnMoves[2], friend);
                    }
                }
                break;
            case pawnMoves[3]:
                if (edges[index] !== 0){
                    if (position.board[index + pawnMoves[3]] & enemy){
                        legalMoves.addPawnMove(index, index + pawnMoves[3], friend);                       
                    }
                }
                break;
        }

    } else {

        if (edges[index] !== 0){
            if (position.board[index + pawnMoves[3]] & enemy){
                legalMoves.addPawnMove(index, index + pawnMoves[3], friend);                       
            }
        }
        if (edges[index] !== 3){
            if (position.board[index + pawnMoves[2]] & enemy){
                legalMoves.addPawnMove(index, index + pawnMoves[2], friend);
            } 
        }
        if (position.board[index + pawnMoves[0]] === 0){
            legalMoves.addPawnMove(index, index + pawnMoves[0], friend);
            if (position.board[index + pawnMoves[1]] === 0 && position.moveState.onSecondRank(index)){
                legalMoves.addMove(index, index + pawnMoves[1]);
            }
        }
        
    }
}