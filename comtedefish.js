/* Pieces: 
0: None, 1: White Pawn, 2: White Knight, 3: White Bishop, 4: White Rook, 5: White Queen, 6: White King, 
9: Black Pawn, 10: Black Knight, 11: Black Bishop, 12: Black Rook, 13: Black Queen, 14: Black King
*/ 

const edges = [
    0, 1, null, null, null, null, 2 ,3,
    0, 1, null, null, null, null, 2 ,3,
    0, 1, null, null, null, null, 2 ,3,
    0, 1, null, null, null, null, 2 ,3,
    0, 1, null, null, null, null, 2 ,3,
    0, 1, null, null, null, null, 2 ,3,
    0, 1, null, null, null, null, 2 ,3,
    0, 1, null, null, null, null, 2 ,3
    ];

const piece = {
    white: 8, // 1000
    black: 16, // 10000
    pawn: 1,  // 0001
    knight: 2,// 0010
    bishop: 3,// 0011
    rook: 4,  // 0100
    queen: 5, // 0101
    king: 6   // 0110
}


class BitBoard {
    constructor(int){
        this.int = int[0];
    }
    holds(index){
        this.int >>> index;
        return Boolean(this.int >>> index & 1)
    }
    add(index){
        let num = 1n << index;
        this.int = this.int | num;
    }
    forEach1(func){
        let num = this.int;
        while (num !== 0){
            func(index);
            num &= (num - 1n);
        }
    }
}

class Square {
    constructor(piece){
        this.piece = piece;
        this.pinned;
        this.block;
        this.EPblock;
        this.controlled;
    }
}
export class Position {
    constructor(currentBoard, castleRights, enPassantSquare, toMove, pieces){
        this.board = currentBoard;
        this.castleRights = castleRights;  // white kingside, white queenside, black kingside, black queenside
        this.enPassantSquare = enPassantSquare;
        this.toMove = toMove;       
        this.legalMoves = this.calculateLegalMoves();
    }
    


    calculateLegalMoves(){
        let legalMoves = [];
        let inCheck = false;
        let inDoubleCheck = false;
        let oppControlledSquares = new BitBoard(0n);
        let blockSquares = new BitBoard(0n);
        let enPassantBlockSquare = null;
        const addPawnControlledSquare = (square, homeSquare) => {
            if (this.board[square].piece === (this.friendly | piece.king)){
                if (inCheck){
                    inDoubleCheck = true;
                } else {
                    inCheck = true;
                    this.board[homeSquare].block = true;
                    let squareOffset = (this.toMove = "w") ? 8 : -8;
                    if (this.enPassantSquare = homeSquare - squareOffset){
                        this.board[homeSquare - squareOffset].EPblock = true;
                    }
                }
            } else {
                this.board[square].controlled = true;
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
                        if (this.board[currentSquare + i].piece === 0){
                            this.board[currentSquare + i].controlled = true;
                            currentSquare += i;   
                        } else if (this.board[currentSquare + i].piece & this.friendly){
                            if (this.board[currentSquare + i].piece === this.friendly | piece.king){
                                if (inCheck){
                                    inDoubleCheck = true;
                                } else {
                                    inCheck = true;
                                    while (currentSquare !== homeSquare - i){
                                        this.board[currentSquare].block = true;
                                        currentSquare -= i;
                                    }
                                }
                                break;
                            }
                            this.board[currentSquare + i].controlled = true;
                            let potentialPinnedPiece = currentSquare + i;
                            currentSquare += i;
                            while (edges[currentSquare] !== edge){
                                if (this.board[currentSquare + i].piece === 0){
                                    currentSquare += i;
                                } else if (this.board[currentSquare + i].piece === this.friendly | piece.king){ // find pinned pieces
                                    this.board[potentialPinnedPiece].pinned = i;                     
                                    break;
                                } else {
                                    break;
                                }
                            }
                            break;
                        } else if (this.board[currentSquare + i].piece & this.enemy){
                            this.board[currentSquare + i].controlled = true;
                            break;
                        } else {
                            break;
                        }                        
                    }
            }
        }
        for (let i of this.enemyPieces.pawns){            
            let directions = (this.toMove === "b") ? [i - 7, i - 9] : [i + 9, i + 7];                    
            if (edges[i] === 0){
                addPawnControlledSquare(directions[0], i);
            } else if (edges[i] === 3){
                addPawnControlledSquare(directions[1], i);
            } else {
                addPawnControlledSquare(directions[0], i);
                addPawnControlledSquare(directions[1], i);
            }
        }
        for (let i of this.enemyPieces.knights){
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
                if (this.currentBoard[j] !== undefined){
                    oppControlledSquares[j] = 1;
                    if (j === this.friendlyPieces.king){
                        if (inCheck){
                            inDoubleCheck = true;
                        } else {
                            inCheck = true;
                            blockSquares[i] = 1;
                        }
                    }
                }
            }
        
        }                   
        for (let i of this.enemyPieces.bishops){               
            generateEnemySlidingMoves(i, [-9, 7, -7, 9]);
        }        
        for (let i of this.enemyPieces.rooks){               
            generateEnemySlidingMoves(i, [-8, 8, -1, 1]);  
        }
        for (let i of this.enemyPieces.queens){
            generateEnemySlidingMoves(i, [-9, 7, -7, 9, -8, 8, -1, 1]);                  
        } 

        const generateSlidingMoves = (homeSquare, directions) => {
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
                    for (let a of pinnedPieces){
                        if (a.square === homeSquare && a.direction !== i  && a.direction !== -i){
                            continue slidingDirections;
                        }
                    }
                    while (edges[currentSquare] !== edge){
                        if (this.currentBoard[currentSquare + i] === 0){
                            legalMoves.push([homeSquare, currentSquare + i]);
                            currentSquare += i;   
                        } else if (this.isEnemy(this.currentBoard[currentSquare + i])){
                            legalMoves.push([homeSquare, currentSquare + i]);
                            break;
                        } else {
                            break;
                        }                        
                   }
            }
        } 

        let checkingPieceIndex = oppControlledSquares[this.friendlyPieces.king];

        if (!inCheck) { // generate moves while not in check
            for (let i of this.friendlyPieces.pawns){        
                let pinned = false;
                let pinnedDirection = null;
                for (let j of pinnedPieces){
                    if (i === j.square){
                        pinned = true;
                        pinnedDirection = j.direction;
                    }
                }
                if (pinned === false){
                    let directions = (this.toMove === "w") ? [i - 8, i - 16, i - 7, i - 9] : [i + 8, i + 16, i + 9, i + 7];
                    if (this.currentBoard[directions[0]] === 0){
                        if (this.currentBoard[directions[1]] === 0 && this.onSecondRank(i)) {
                            legalMoves.push([i, directions[1]]); 
                        }
                        this.addPawnMove(legalMoves, i, directions[0]);
                    }
                    if (edges[i] !== 3 && this.isEnemy(this.currentBoard[directions[2]])){
                        this.addPawnMove(legalMoves, i, directions[2]);
                    }
                    if (edges[i] !== 0 && this.isEnemy(this.currentBoard[directions[3]])){
                        this.addPawnMove(legalMoves, i, directions[3]);
                    }
                    const EPIsLegal = (square1, square2) => {
                        let currentSquare = square1;
                        let foundKing = false;
                        let foundRook = false;
                        while (edges[currentSquare] !== 0){
                            if (this.currentBoard[currentSquare - 1] === 0){
                                currentSquare--;
                            } else if (currentSquare - 1 === this.friendlyPieces.king){
                                foundKing = true;
                                break;
                            } else if (this.enemyPieces.rooks.includes(currentSquare - 1) || this.enemyPieces.queens.includes(currentSquare - 1)){
                                foundRook = true;
                                break;
                            } else {
                                return true;
                            }                        
                        }
                        currentSquare = square2;
                        while (edges[currentSquare] !== 3){
                            if (this.currentBoard[currentSquare + 1] === 0){
                                currentSquare++;
                            } else if (currentSquare + 1 === this.friendlyPieces.king){
                                foundKing = true;
                                break;
                            } else if (this.enemyPieces.rooks.includes(currentSquare + 1) || this.enemyPieces.queens.includes(currentSquare + 1)){
                                foundRook = true;
                                break;
                            } else {
                                return true;
                            }                        
                        }
                        
                        if (foundKing && foundRook){
                            return false;
                        } else {
                            return true;
                        }
                    }
                    if ((this.enPassantSquare === directions[2] && EPIsLegal(i, i+1) && edges[i] !== 3) || (this.enPassantSquare === directions[3] && EPIsLegal(i-1, i) && edges[i] !== 0)){
                        this.addPawnMove(legalMoves, i, this.enPassantSquare);                                        
                    }
                } else {
                    
                    if (pinnedDirection < 0 && this.toMove === "b"){
                        pinnedDirection = -pinnedDirection;
                    } else if (pinnedDirection > 0 && this.toMove === "w"){
                        pinnedDirection = -pinnedDirection;
                    }
                    
                    switch (pinnedDirection){
                        case -8:
                            if (this.currentBoard[i - 8] === 0){
                                if (this.currentBoard[i - 16] === 0 && this.onSecondRank(i)) {
                                    legalMoves.push([i, i - 16]);
                                }
                                this.addPawnMove(legalMoves, i, i-8);
                                break;
                            }                        
                        case 8:
                            if (this.currentBoard[i + 8] === 0){
                                if (this.currentBoard[i + 16] === 0 && this.onSecondRank(i)) {
                                    legalMoves.push([i, i + 16]);
                                }
                                this.addPawnMove(legalMoves, i, i+8);
                                break;
                            }
                        case -7:
                        case 9:
                            if (edges[i] !== 3 && (this.isEnemy(this.currentBoard[i + pinnedDirection]) || this.enPassantSquare === i + pinnedDirection)){
                                this.addPawnMove(legalMoves, i, i + pinnedDirection);
                            }
                        case -9:
                        case 7:
                            if (edges[i] !== 0 && (this.isEnemy(this.currentBoard[i + pinnedDirection]) || this.enPassantSquare === i + pinnedDirection)){
                                this.addPawnMove(legalMoves, i, i + pinnedDirection);
                            }                 
                    }
                }                                                                    
            }
            knightMoves: for (let i of this.friendlyPieces.knights){
                for (let j of pinnedPieces){
                    if (i === j.square){
                        continue knightMoves;
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
                    if (this.currentBoard[j] === 0 || this.isEnemy(this.currentBoard[j])){
                        legalMoves.push([i, j])
                    }
                }
                           
            }
            for (let i of this.friendlyPieces.bishops){
                generateSlidingMoves(i, [9, -9, 7, -7])
            }
            for (let i of this.friendlyPieces.rooks){
                generateSlidingMoves(i, [8, -8, 1, -1])
            }
            for (let i of this.friendlyPieces.queens){
                generateSlidingMoves(i, [8, -8, 1, -1, 9, -9, 7, -7])
            }
            // generate king moves
            {
                let directions = [8, -8, 1, -1, 9, -9, 7, -7];
                let kingPos = this.friendlyPieces.king;
                for (let i of directions){
                    if (oppControlledSquares[kingPos + i] === null && (this.currentBoard[kingPos + i] === 0 || this.isEnemy(this.currentBoard[kingPos + i]))){
                        legalMoves.push([kingPos, kingPos + i])
                    }
                }
            //castling
                if (this.toMove = "w"){
                    if (this.castleRights[0] === true){
                        if (this.currentBoard[61] === 0 && this.currentBoard[62] === 0 && 
                            oppControlledSquares[61] === null && oppControlledSquares[62] === null){
                            legalMoves.push(["O-O"]);
                        }
                    }
                    if (this.castleRights[1] === true){
                        if (this.currentBoard[59] === 0 && this.currentBoard[58] === 0 && this.currentBoard[57] === 0 && 
                            oppControlledSquares[59] === null && oppcontrolledSquares[58] === null && oppControlledSquares[57] === null){
                            legalMoves.push(["O-O-O"]);
                        }
                    }                
                } else {
                    if (this.castleRights[3] === true){
                        if (this.currentBoard[5] === 0 && this.currentBoard[6] === 0 && 
                            oppControlledSquares[5] === null && oppcontrolledSquares[6] === null){
                            legalMoves.push(["O-O"]);
                        }
                    }
                    if (this.castleRights[4] === true){
                        if (this.currentBoard[3] === 0 && this.currentBoard[2] === 0 && this.currentBoard[1] === 0 && 
                            oppControlledSquares[3] === null && oppcontrolledSquares[2] === null && oppControlledSquares[1] === null){
                            legalMoves.push(["O-O-O"]);
                        }
                    }
                }
    
            }
        } else if (!inDoubleCheck){ // generate moves while in check by only one piece
           
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

                let directions = (this.toMove === "w") ? [i - 8, i - 16, i - 7, i - 9] : [i + 8, i + 16, i + 9, i + 7];                    
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
10,8, 9, 11,12,9, 8, 10,
7, 7, 7, 7, 7, 7, 7, 7,
0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0,
1, 1, 1, 1, 1, 1, 1, 1,
4, 2, 3, 5, 6, 3, 2, 4 



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
