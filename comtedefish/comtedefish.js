import {edges, piece} from "./constants.js"
import colorState from "./colorstate.js"
import {Move, PromotionMove, LegalMovesList} from "./move.js"
import getControlledAndPinned from "./enemysquares.js";
import generateSlidingMoves from "./movegen/friendly/slidingmoves.js";
import generatePawnMoves from "./movegen/friendly/pawnmoves.js";
import generateKnightMoves from "./movegen/friendly/knightmoves.js";
import generateKingMoves from "./movegen/friendly/kingmoves.js";
import generateSlidingMovesInCheck from "./movegen/incheck/slidingmovesincheck.js";
import generateKnightMovesInCheck from "./movegen/incheck/knightmovesincheck.js";
import generatePawnMovesInCheck from "./movegen/incheck/pawnmovesincheck.js";
export class Position {
    constructor(currentBoard, castleRights, enPassantSquare, toMove){
        this.board = currentBoard;
        this.castleRights = castleRights;  // white kingside, white queenside, black kingside, black queenside
        this.enPassantSquare = enPassantSquare;
        this.moveState = colorState[toMove];
        this.legalMoves = this.calculateLegalMoves();
    }
    


    calculateLegalMoves(){
        // initialize
        let legalMoves = new LegalMovesList();
        let inCheck = false;
        let inDoubleCheck = false;
        let {checkStatus, blockSquares, enPassantBlockSquare, oppControlledSquares, pinnedPieces} = getControlledAndPinned(this);  
        let friend = this.moveState.friend;
        let enemy = 3 ^ friend;
        
        if (checkStatus === 0) { // generate moves while not in check
            for (let i = 0; i < 64; i++){
                switch (this.board[i] ^ friend){
                    case piece.pawn: {
                        generatePawnMoves(i, this, pinnedPieces, legalMoves, friend, enemy);
                        break;
                    } case piece.knight: {
                        if (pinnedPieces[i] === 0){
                            generateKnightMoves(i, this, legalMoves, enemy);
                        }
                        break;
                    } case piece.bishop: {
                        generateSlidingMoves(i, [9, -9, 7, -7], this, legalMoves, pinnedPieces);
                        break;
                    } case piece.rook: {
                        generateSlidingMoves(i, [1, -8, -1, 8], this, legalMoves, pinnedPieces);
                        break;
                    } case piece.queen: {
                        generateSlidingMoves(i, [9, -9, 7, -7, 1, -8, -1, 8], this, legalMoves, pinnedPieces);
                        break;
                    } case piece.king: {
                        generateKingMoves(i, this, legalMoves, oppControlledSquares, enemy);
                        break;
                    }                                            
                }
            }
        } else if (checkStatus === 1){ // generate moves when checked once
            for (let i = 0; i < 64; i++){
                switch (this.board[i] ^ friend){
                    case piece.pawn: {
                        generatePawnMovesInCheck(index, this, pinnedPieces, legalMoves, blockSquares, friend, enemy);
                        break;
                    } case piece.knight: {
                        if (pinnedPieces[i] === 0){
                            generateKnightMovesInCheck(i, legalMoves, blockSquares);
                        }
                        break;
                    } case piece.bishop: {
                        generateSlidingMovesInCheck(i, [9, -9, 7, -7], this, legalMoves, pinnedPieces, blockSquares);
                        break;
                    } case piece.rook: {
                        generateSlidingMovesInCheck(i, [1, -8, -1, 8], this, legalMoves, pinnedPieces, blockSquares);
                        break;
                    } case piece.queen: {
                        generateSlidingMovesInCheck(i, [9, -9, 7, -7, 1, -8, -1, 8], this, legalMoves, pinnedPieces, blockSquares);
                        break;
                    } case piece.king: {
                        generateKingMoves(i, this, legalMoves, oppControlledSquares, enemy);
                        break;
                    }                                            
                }
            }
        } else {
            generateKingMoves(this.board.indexOf(friend | piece.king), this, legalMoves, oppControlledSquares, enemy);
        }  
        return(legalMoves);
    }

    
}


export let currentPosition = new Position(new Uint8Array([
    10,8, 9, 11,0,12, 0, 10,
    7, 7, 0, 1, 9, 7, 7, 7,
    0, 0, 7, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 3, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 0, 2, 8, 1, 1,
    4, 2, 3, 5, 6, 0, 0, 4
]), [true, true, false, false], null, "w");

/* original position:
 



*/


let positionsEvaluated = 0;

function search(position, depth){
    if (depth > 0){
        for (let i of position.legalMoves){
            let newPosition = position.makeMove(...i);

             
            search(newPosition, depth - 1);
        }
    } else {
        positionsEvaluated++;
    }       
}

search(currentPosition, 2);
console.log(positionsEvaluated);
