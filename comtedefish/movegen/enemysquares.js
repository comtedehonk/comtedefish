import BitBoard from "../bitboard.js"
import {edges, piece} from "../constants.js"
import pawnState from "./pawnstate.js"
export default function getControlledAndPinned(position, friend, enemy){    
    const pawnDirections = pawnState[friend].enemyPawnMoves;
    let state = {
        checkStatus: 0,
        blockSquares: new BitBoard(),
        enPassantBlockSquare: null,
        oppControlledSquares: new BitBoard(),
        pinnedPieces: new Int8Array()
    }

    const addPawnControlledSquare = (square, homeSquare) => {
        if (position.board[square] === (friend | piece.king)){
            if (state.checkStatus === 0){
                state.checkStatus = 1;
                state.blockSquares.setBit(homeSquare);
                let squareBehindPawn = homeSquare - pawnDirections[0]
                if (position.enPassantSquare = squareBehindPawn){
                    state.enPassantBlockSquare = squareBehindPawn;
                }
            } else if (state.checkStatus === 1){
                state.checkStatus = 2;
            }
        } else {
            state.oppControlledSquares.setBit(square);
        }
    }

    const generateEnemySlidingMoves = (homeSquare, directions) => {
        for (let i of directions){
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
                if (position.board[currentSquare + i] === 0){
                    state.oppControlledSquares.setBit(currentSquare + i);
                    currentSquare += i;   
                } else if (position.board[currentSquare + i] & friend){
                    if (position.board[currentSquare + i] ^ friend === piece.king){
                        if (state.checkStatus === 0){
                            state.checkStatus = 1;
                            while (currentSquare !== homeSquare - i){
                                state.blockSquares.setBit(currentSquare);
                                currentSquare -= i;
                            }
                        } else if (state.checkStatus === 1) {
                            state.checkStatus = 2
                        }
                        break;
                    }
                    state.oppControlledSquares.setBit(currentSquare + i);
                    let potentialPinnedPiece = currentSquare + i;
                    currentSquare += i;
                    while (edges[currentSquare] !== edge){
                        if (position.board[currentSquare + i] === 0){
                            currentSquare += i;
                        } else if (position.board[currentSquare + i] === (friend | piece.king)){ // find pinned pieces
                            state.pinnedPieces[potentialPinnedPiece] = i;                    
                            break;
                        } else {
                            break;
                        }
                    }
                    break;
                } else if (position.board[currentSquare + i] & enemy){
                    state.oppControlledSquares.setBit(currentSquare + i);
                    break;
                } else {
                    break;
                }                        
            }
        }
    }

    for (let i = 0; i < 64; i++){ // generate opponent controlled squares
        switch (position.board[i] ^ enemy){
            case piece.pawn: {                   
                if (edges[i] === 0){
                    addPawnControlledSquare(i + pawnDirections[1], i);
                } else if (edges[i] === 3){
                    addPawnControlledSquare(i + pawnDirections[2], i);
                } else {
                    addPawnControlledSquare(i + pawnDirections[1], i);
                    addPawnControlledSquare(i + pawnDirections[2], i);
                }
                break;
            } case piece.knight: {
                let validMoves = [];
                switch (edges[i]){
                    case 4:
                        validMoves.push(i-15, i-6, i+10, i+17, i-17, i+15, i-10, i+6);
                    case 0:
                        validMoves.push(i-15, i-6, i+10, i+17);
                    case 1:
                        validMoves.push(i-15, i-6, i+10, i+17, i-17, i+15);
                    case 2:
                        validMoves.push(i-15, i+17, i-17, i+15, i-10, i+6);
                    case 3:
                        validMoves.push(i-17, i+15, i-10, i+6);
                }
    
                for (let j of validMoves){
                    if (position.board[j] !== undefined){
                        state.oppControlledSquares.setBit(j);
                        if (j === (friend | piece.king)){
                            if (state.checkStatus === 0){
                                state.checkStatus = 1;
                                state.blockSquares.setBit(i);
                            } else if (state.checkStatus === 1){
                                state.checkStatus = 2;
                            }                           
                        }
                    }
                }
                break;
            } case piece.bishop: {
                generateEnemySlidingMoves(i, [-9, 7, -7, 9]);
                break;
            } case piece.rook: {
                generateEnemySlidingMoves(i, [-8, 8, -1, 1]);
                break;
            } case piece.queen: {
                generateEnemySlidingMoves(i, [-9, 7, -7, 9, -8, 8, -1, 1]); 
                break;
            } case piece.king: {
                let validMoves;
                if (edges[i] === 0){
                    validMoves = [i-8, i-7, i+1, i+9, i+8];
                } else if (edges[i] === 3){
                    validMoves = [i-9, i-8, i+7, i+8, i-1];
                } else {
                    validMoves = [i-9, i-8, i+7, i+8, i-1, i-7, i+9];
                }
                for (let j of validMoves){
                    if (position.board[j] !== undefined){
                        state.oppControlledSquares.setBit(j);
                    }
                }
                break;
            }
        }
    }
    return state;
}