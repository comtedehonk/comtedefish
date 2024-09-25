import {edges} from "../../constants.js";
import pawnState from "../pawnstate.js";
export default function generatePawnMoves(index, position, pinnedPieces, legalMoves, friend, enemy){
    
    let pawnMoves = pawnState[friend].pawnMoves.map((value) => {
        return index + value;
    });

    if (pinnedPieces[index]){ 
        let direction = (friend === 2) ? Math.abs(pinnedPieces[index]) : -Math.abs(pinnedPieces[index]);
        switch (direction + index){
            case pawnMoves[0]:
                if (position.board[pawnMoves[0]] === 0){
                    legalMoves.addPawnMove(index, pawnMoves[0], friend)
                    if (position.board[pawnMoves[1]] === 0 && pawnState[friend].onSecondRank(index)){
                        legalMoves.addMove(index, pawnMoves[1]);
                    }
                }
                break;
            case pawnMoves[2]:
                if (edges[index] !== 3){
                    if (position.board[pawnMoves[2]] & enemy){
                        legalMoves.addPawnMove(index, pawnMoves[2], friend);
                    }
                }
                break;
            case pawnMoves[3]:
                if (edges[index] !== 0){
                    if (position.board[pawnMoves[3]] & enemy){
                        legalMoves.addPawnMove(index, pawnMoves[3], friend);                       
                    }
                }
                break;
        }

    } else {

        if (edges[index] !== 0){
            if (position.board[pawnMoves[3]] & enemy){
                legalMoves.addPawnMove(index, pawnMoves[3], friend);                       
            }
        }
        if (edges[index] !== 3){
            if (position.board[pawnMoves[2]] & enemy){
                legalMoves.addPawnMove(index, pawnMoves[2], friend);
            } 
        }
        if (position.board[pawnMoves[0]] === 0){
            legalMoves.addPawnMove(index, pawnMoves[0], friend);
            if (position.board[pawnMoves[1]] === 0 && pawnState[friend].onSecondRank(index)){
                legalMoves.addMove(index, pawnMoves[1]);
            }
        }
        
    }
}