import {edges, piece, originalPosition} from "./constants.js"
// const {pawn: PAWN, knight: KNIGHT, bishop: BISHOP, rook: ROOK, queen: QUEEN, king: KING} = piece; future micro-optimisation
import colorState from "./movegen/pawnstate.js"
import {Move, PromotionMove, LegalMovesList} from "./move.js"
import getControlledAndPinned from "./movegen/enemysquares.js";
import generateSlidingMoves from "./movegen/friendly/slidingmoves.js";
import generatePawnMoves from "./movegen/friendly/pawnmoves.js";
import generateKnightMoves from "./movegen/friendly/knightmoves.js";
import generateKingMoves from "./movegen/friendly/kingmoves.js";
import generateSlidingMovesInCheck from "./movegen/incheck/slidingmovesincheck.js";
import generateKnightMovesInCheck from "./movegen/incheck/knightmovesincheck.js";
import generatePawnMovesInCheck from "./movegen/incheck/pawnmovesincheck.js";

export class Position {
    constructor(currentBoard, state){
        this.board = currentBoard;
        this.state = state;
        /*
        last 1 bits: side to move (0 white, 1 black)
        next 4 bits: castle rights (black queen, black king, white queen, white king)
        next 6 bits: en passant square
        next 6 bits: half-move counter        
        */
        

        this.legalMoves = this.calculateLegalMoves();
    }
    
    get friend(){
        return (state & 1) + 1;
    }

    calculateLegalMoves(){
        let legalMoves = new LegalMovesList();
        let {checkStatus, blockSquares, enPassantBlockSquare, oppControlledSquares, pinnedPieces} = getControlledAndPinned(this);  
        let friend = this.friend;
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
                        generateSlidingMoves(i, [9, -9, 7, -7], this, legalMoves, pinnedPieces, enemy);
                        break;
                    } case piece.rook: {
                        generateSlidingMoves(i, [1, -8, -1, 8], this, legalMoves, pinnedPieces, enemy);
                        break;
                    } case piece.queen: {
                        generateSlidingMoves(i, [9, -9, 7, -7, 1, -8, -1, 8], this, legalMoves, pinnedPieces, enemy);
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

    makeMove(move){
    /**

    Move - Last 6 bits: final square
    next 6: original square
    next 8: promotion piece

    */
        let newBoard = new Uint8Array(this.board);
        let newState = this.state;
        let homeSquare = (move & 0b111111000000) >>> 6;
        let finalSquare = move & 0b111111;
        if (this.board[homeSquare] & piece.pawn){
            let promotionPiece = move & 0b11111111000000000000;
            if (promotionPiece > 0){
                newBoard[finalSquare] = promotionPiece >>> 12;
            } else {
                newBoard[finalSquare] = newBoard[homeSquare];
                newBoard[homeSquare] = 0;
            }
        } else if (this.board[homeSquare] & piece.king){

        } else if (this.board[homeSquare] & piece.rook){

        } else {

        }
        
        
    }
    
}


export let currentPosition = new Position(new Uint8Array(originalPosition), [true, true, false, false], null, "w");

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
