import {edges, piece, originalPosition} from "./constants.js"
// const {pawn: PAWN, knight: KNIGHT, bishop: BISHOP, rook: ROOK, queen: QUEEN, king: KING} = piece; future micro-optimisation
import pawnState from "./movegen/pawnstate.js"
import {LegalMovesList} from "./move.js"
import getControlledAndPinned from "./movegen/enemysquares.js";
import generateSlidingMoves from "./movegen/friendly/slidingmoves.js";
import generatePawnMoves from "./movegen/friendly/pawnmoves.js";
import generateKnightMoves from "./movegen/friendly/knightmoves.js";
import generateKingMoves from "./movegen/friendly/kingmoves.js";
import generateEnPassant from "./movegen/friendly/enpassant.js";
import generateCastling from "./movegen/friendly/castle.js";
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
    // data unpacking
    get friend(){
        return (this.state & 1) + 1;
    }

    get castleRights(){
        return (this.state >>> 1) & 0b1111;
    }

    get friendlyCastleRights(){
        return (this.state >>> ((this.state & 1) * 2 + 1)) & 0b11; // branchless (left queen right king)
    }

    get enPassantSquare(){
        return (this.state >>> 5) & 0b111111;
    }

    get halfMoveCount(){
        return (this.state >>> 11) & 0b111111;
    }

    calculateLegalMoves(){
        let legalMoves = new LegalMovesList();
        let friend = this.friend;
        let enemy = 3 ^ friend;
        let {checkStatus, blockSquares, enPassantBlockSquare, oppControlledSquares, pinnedPieces} = getControlledAndPinned(this, friend, enemy);  
        
        
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
                        if (this.friendlyCastleRights) generateCastling(i, this, legalMoves, oppControlledSquares, this.friendlyCastleRights);
                        break;
                    }                                            
                }
            }

            if (this.enPassantSquare){
                generateEnPassant(this, this.enPassantSquare, pinnedPieces, legalMoves, friend, enemy);
            }

        } else if (checkStatus === 1){ // generate moves when checked once
            for (let i = 0; i < 64; i++){
                switch (this.board[i] ^ friend){
                    case piece.pawn: {
                        generatePawnMovesInCheck(i, this, pinnedPieces, legalMoves, blockSquares, friend, enemy);
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
    next 5: promotion piece
    next 2 castle?:
        00: no  01: kingside 10: queenside
    next 1: en passant?
    */
        let friend = this.friend;
        let enemy = friend ^ 3;
        let newBoard = new Uint8Array(this.board);
        let newState = ((this.halfMoveCount + 1) << 11) | (this.castleRights << 1) | (enemy - 1);
        let homeSquare = (move & 0b111111000000) >>> 6;
        let finalSquare = move & 0b111111;
        switch (this.board[homeSquare] ^ friend) {
            case piece.pawn: {
                let promotionPiece = move & 0b11111000000000000;
                if (promotionPiece > 0){
                    newBoard[finalSquare] = promotionPiece >>> 12;
                } else {
                    newBoard[finalSquare] = newBoard[homeSquare];
                    newBoard[homeSquare] = 0;
                    if (finalSquare - homeSquare === pawnState[friend].pawnMoves[1] 
                        && ((edges[finalSquare] !== 0 && finalSquare - 1 === (enemy | piece.pawn))
                        || (edges[finalSquare] !== 3 && finalSquare + 1 === (enemy | piece.pawn)))
                    ){ // check if opponent can en passant
                        newState |= (homeSquare + pawnState[friend].pawnMoves[0]);
                    } else if (move >>> 19 === 1){ // is move en passant?
                        newBoard[this.enPassantSquare] = 0;
                    }
                }
                break;
            } case piece.king: {
                let castleRights = (move >> 17) & 0b11;
                switch (castleRights){
                    case 0:
                        break;
                    case 1:
                        newBoard[finalSquare - 1] = (friend | piece.rook);
                        newBoard[finalSquare + 1] = 0;
                        break;
                    case 2:
                        newBoard[finalSquare + 1] = (friend | piece.rook);
                        newBoard[finalSquare - 2] = 0;
                        break;
                }
                newBoard[finalSquare] = newBoard[homeSquare];
                newBoard[homeSquare] = 0;
                (friend === 1) ? newState &= 0b11111111111111001 : newState &= 0b11111111111100111;
                break;
            } case piece.rook: {
                switch (homeSquare){
                    case 0:
                        newState &= 0b11111111111101111;
                        break;
                    case 7:
                        newState &= 0b11111111111110111;
                        break;
                    case 56:
                        newState &= 0b11111111111111011;
                        break;
                    case 63:
                        newState &= 0b11111111111111101;
                        break;
                }
                break;
            } default: {
                break;
            }
        }
        
        switch (finalSquare){
            case 0:
                newState &= 0b11111111111101111;
                break;
            case 7:
                newState &= 0b11111111111110111;
                break;
            case 56:
                newState &= 0b11111111111111011;
                break;
            case 63:
                newState &= 0b11111111111111101;
                break;
        }
        
        return new Position(newBoard, newState);

    }
    
}


export let currentPosition = new Position(new Uint8Array(originalPosition), 0b00000000000011110);

/* original position:
 



*/


let positionsEvaluated = 0;

function search(position, depth){
    if (depth > 0){
        for (let i of position.legalMoves){
            let newPosition = position.makeMove(i);

             
            search(newPosition, depth - 1);
        }
    } else {
        positionsEvaluated++;
    }       
}

search(currentPosition, 1);
console.log(positionsEvaluated);
