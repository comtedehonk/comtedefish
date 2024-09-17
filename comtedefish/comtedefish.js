import {edges, piece} from "./constants.js"
import colorState from "./colorstate.js"
import BitBoard from "./bitboard.js";
import {Move, PromotionMove, LegalMovesList} from "./move.js"
import getControlledAndPinned from "./enemysquares.js";
import generateSlidingMoves from "./movegen/slidingmoves.js";
import generatePawnMoves from "./movegen/pawnmoves.js";
import generateKnightMoves from "./movegen/knightmoves.js";
import generateKingMoves from "./movegen/kingmoves.js"


export class Position {
    constructor(currentBoard, castleRights, enPassantSquare, toMove){
        this.board = currentBoard;
        this.castleRights = castleRights;  // white kingside, white queenside, black kingside, black queenside
        this.enPassantSquare = enPassantSquare;
        this.moveState = colorState[toMove]
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
                        generatePawnMoves(index);
                        break;
                    } case piece.knight: {
                        if (pinnedPieces[i] === 0){
                            generateKnightMoves(i, this, legalMoves)
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
                        generateKingMoves(i, this, legalMoves, oppControlledSquares, enemy)
                        break;
                    }                                            
                }
            }
        } else if (checkStatus === 1){ // generate moves when checked once

        } else {

        }
if (!inDoubleCheck){ // generate moves while in check by only one piece
           
            const generateSlidingMovesInCheck = (homeSquare, directions) => {
                for (let j of pinnedPieces){
                    if (homeSquare === j.square){
                        return;
                    }
                }    
                slidingDirections: for (let i of directions){
                    let currentSquare = homeSquare;
                        let edge;
                        switch (i){ 
                            case -9:
                            case  7:
                            case -1:
                                edge = 0;
                                break;
                            case 1:
                            case -7:
                            case 9:
                                edge = 3;
                                break;                                            
                        }
                        while (edges[currentSquare] !== edge){
                            if (this.currentBoard[currentSquare + i] === 0){
                                if (blockSquares[currentSquare + i] === 1){
                                    legalMoves.push([homeSquare, currentSquare + i]);
                                    continue slidingDirections;
                                }
                                currentSquare += i;   
                            } else if (blockSquares[currentSquare + i] === 1){
                                legalMoves.push([homeSquare, currentSquare + i]);
                                continue slidingDirections;
                            } else {
                                continue slidingDirections;
                            }                        
                       }
                }
            }

            pawnMovesInCheck: for (let i of this.friendlyPieces.pawns){        

                for (let j of pinnedPieces){
                    if (i === j.square){
                        continue pawnMovesInCheck;
                    }
                }

                let directions = (this.moveState.toMove === "w") ? [i - 8, i - 16, i - 7, i - 9] : [i + 8, i + 16, i + 9, i + 7];                    
                if (blockSquares[directions[0]] === 1 && this.currentBoard[directions[0]] === 0){
                    this.addPawnMove(legalMoves, i, directions[0]);
                } else if (blockSquares[directions[1]] === 1 && this.currentBoard[directions[0]] === 0 && this.currentBoard[directions[1]] === 0 && this.onSecondRank(i)){
                    this.addPawnMove(legalMoves, i, directions[1]);
                }
                if (blockSquares[directions[2]] === 1 && edges[i] !== 3 && this.isEnemy(this.currentBoard[directions[2]])){
                    this.addPawnMove(legalMoves, i, directions[2]);
                }
                if (blockSquares[directions[3]] === 1 && edges[i] !== 0 && this.isEnemy(this.currentBoard[directions[3]])){
                    this.addPawnMove(legalMoves, i, directions[3]);
                }
                if ((blockSquares[directions[2]] === 2 && edges[i] !== 3) || (blockSquares[directions[3]] === 2 && edges[i] !== 0)){
                    this.addPawnMove(legalMoves, i, this.enPassantSquare);                                      
                }
                                                               
            }
            knightMovesInCheck: for (let i of this.friendlyPieces.knights){
                for (let j of pinnedPieces){
                    if (i === j.square){
                        continue knightMovesInCheck;
                    }
                }

                let validMoves = [i-6, i-10, i-15, i-17, i+6, i+10, i+15, i+17];
                if (edges[i] === 0){
                    validMoves[3] = null;
                    validMoves[1] = null;
                    validMoves[4] = null;
                    validMoves[6] = null;
                } else if (edges[i] === 1){
                    validMoves[1] = null;
                    validMoves[4] = null;
                } else if (edges[i] === 3){
                    validMoves[7] = null;
                    validMoves[5] = null;
                    validMoves[0] = null;
                    validMoves[2] = null;
                } else if (edges[i] === 2){
                    validMoves[5] = null;
                    validMoves[0] = null;
                }
                for (let j of validMoves){
                    if (blockSquares[j] === 1){
                        legalMoves.push([i, j])
                    }
                }                
            }
            for (let i of this.friendlyPieces.bishops){
                generateSlidingMovesInCheck(i, [9, -9, 7, -7]);
            }
            for (let i of this.friendlyPieces.rooks){
                generateSlidingMovesInCheck(i, [8, -8, 1, -1]);
            }
            for (let i of this.friendlyPieces.queens){
                generateSlidingMovesInCheck(i, [8, -8, 1, -1, 9, -9, 7, -7]);
            }
            { // king
                let directions = [8, -8, 1, -1, 9, -9, 7, -7];
                let kingPos = this.friendlyPieces.king;                
                for (let i of directions){
                    let newKingPos = kingPos + i;
                    if (oppControlledSquares[newKingPos] === null && (this.currentBoard[newKingPos] === 0 || this.isEnemy(this.currentBoard[newKingPos]))){
                        legalMoves.push([kingPos, newKingPos]);
                    }
                }
            }
            
        } else { // generate moves while double checked
            { // king
                let directions = [8, -8, 1, -1, 9, -9, 7, -7];
                let kingPos = this.friendlyPieces.king;                
                for (let i of directions){
                    let newKingPos = kingPos + i;
                    if (oppControlledSquares[newKingPos] === null && (this.currentBoard[newKingPos] === 0 || this.isEnemy(this.currentBoard[newKingPos]))){
                        legalMoves.push([kingPos, newKingPos]);
                    }
                }
            }
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
