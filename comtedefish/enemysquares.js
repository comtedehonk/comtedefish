import BitBoard from "./bitboard.js"
export function getControlledAndPinned(position){
    const pawnDirections = position.moveState.enemyPawnMoves;
    let state = {
        checkStatus: 0,
        blockSquares: new BitBoard(),
        enPassantBlockSquare: null,
        oppControlledSquares: new BitBoard()
    }

    const addPawnControlledSquare = (square, homeSquare) => {
        if (position.board[square] === (friend | piece.king)){
            if (state.checkStatus === 0){
                state.checkStatus = 1;
                state.blockSquares.setBit(homeSquare);
                let squareOffset = pawnDirections[0];
                if (position.enPassantSquare = homeSquare - squareOffset){
                    state.enPassantBlockSquare = homeSquare - squareOffset;
                }
            } else if (state.checkStatus === 1){
                state.checkStatus = 2;
            }
        } else {
            oppControlledSquares.setBit(square);
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
                    oppControlledSquares.setBit(currentSquare + i);
                    currentSquare += i;   
                } else if (position.board[currentSquare + i] & friend){
                    if (position.board[currentSquare + i] & piece.king){
                        if (inCheck){
                            inDoubleCheck = true;
                        } else {
                            inCheck = true;
                            while (currentSquare !== homeSquare - i){
                                blockSquares.setBit(currentSquare);
                                currentSquare -= i;
                            }
                        }
                        break;
                    }
                    oppControlledSquares.setBit(currentSquare + i);
                    let potentialPinnedPiece = currentSquare + i;
                    currentSquare += i;
                    while (edges[currentSquare] !== edge){
                        if (position.board[currentSquare + i] === 0){
                            currentSquare += i;
                        } else if (position.board[currentSquare + i] === (friend | piece.king)){ // find pinned pieces
                            pinnedPieces[potentialPinnedPiece] = i;                    
                            break;
                        } else {
                            break;
                        }
                    }
                    break;
                } else if (position.board[currentSquare + i] & enemy){
                    oppControlledSquares.setBit(currentSquare + i);
                    break;
                } else {
                    break;
                }                        
            }
        }
    }
}