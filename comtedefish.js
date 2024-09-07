

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
    white: 1, 
    black: 2, 
    pawn: 4,  
    knight: 8,
    bishop: 16,
    rook: 32,  
    queen: 64, 
    king: 128  
}


class BitBoard extends BigUint64Array{
    constructor(){
        super(1)
    }
    holds(index){
        return Boolean((this[0] >>> BigInt(index)) & 1)
    }
    setBit(index){
        let num = 1n << BigInt(index);
        this[0] = this[0] | num;
    }
    forEachBit(func){
        let num = this[0];
        while (num !== 0n){
            func(index);
            num &= (num - 1n);
        }
    }
}

class Move {
    constructor(square1, square2){
        this.square1 = square1;
        this.square2 = square2;
    }
}

class PromotionMove extends Move {
    constructor(square1, square2, promotionPiece){
        super(square1, square2);
        this.promotionPiece = promotionPiece;
    }
}

class legalMovesList extends Array {
    addPawnMove(homeSquare, finalSquare, friendly){
        if (finalSquare < 8 || finalSquare > 55){
            this.push(new PromotionMove(homeSquare, finalSquare, friendly | piece.knight));
            this.push(new PromotionMove(homeSquare, finalSquare, friendly | piece.bishop));
            this.push(new PromotionMove(homeSquare, finalSquare, friendly | piece.rook));
            this.push(new PromotionMove(homeSquare, finalSquare, friendly | piece.queen));
        } else {
            this.push(new Move(homeSquare, finalSquare));
        }
    }
    addMove(homeSquare, finalSquare){
        this.push(new Move(homeSquare, finalSquare))
    }
}

export class Position {
    constructor(currentBoard, castleRights, enPassantSquare, toMove, pieces){
        this.board = currentBoard;
        this.castleRights = castleRights;  // white kingside, white queenside, black kingside, black queenside
        this.enPassantSquare = enPassantSquare;
        this.toMove = toMove;       
        this.legalMoves = this.calculateLegalMoves();
        {
            
        }
    }
    


    calculateLegalMoves(){
        let legalMoves = new legalMovesList();
        let inCheck = false;
        let inDoubleCheck = false;
        let oppControlledSquares = new BitBoard();
        let blockSquares = new BitBoard();
        let enPassantBlockSquare = null;
        let pinnedPieces = new Int8Array(64);
        let friend, enemy;
        const pawnDirections =  (this.toMove = "1") ? [-8, -16, -7, -9, 8, 16, 9, 7] : [8, 16, 9, 7, -8, -16, -7, -9];
        if (this.toMove === 1){
            friend = 1;
            enemy = 2;
        } else {
            friend = 2;
            enemy = 1;
        }
        const addPawnControlledSquare = (square, homeSquare) => {
            if (this.board[square] === (friend | piece.king)){
                if (inCheck){
                    inDoubleCheck = true;
                } else {
                    inCheck = true;
                    blockSquares.setBit(homeSquare);
                    let squareOffset = pawnDirections[0];
                    if (this.enPassantSquare = homeSquare + squareOffset){
                        enPassantBlockSquare = homeSquare + squareOffset;
                    }
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
                    if (this.board[currentSquare + i] === 0){
                        oppControlledSquares.setBit(currentSquare + i)
                        currentSquare += i;   
                    } else if (this.board[currentSquare + i] & friend){
                        if (this.board[currentSquare + i] & piece.king){
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
                            if (this.board[currentSquare + i] === 0){
                                currentSquare += i;
                            } else if (this.board[currentSquare + i] === (friend | piece.king)){ // find pinned pieces
                                pinnedPieces[potentialPinnedPiece] = i;                    
                                break;
                            } else {
                                break;
                            }
                        }
                        break;
                    } else if (this.board[currentSquare + i] & enemy){
                        oppControlledSquares.setBit(currentSquare + i);
                        break;
                    } else {
                        break;
                    }                        
                }
            }
        }

        for (let i = 0; i < 64; i++){ // generate opponent controlled squares
            switch (this.board[i] ^ enemy){
                case piece.pawn: {                   
                    if (edges[i] === 0){
                        addPawnControlledSquare(pawnDirections[6], i);
                    } else if (edges[i] === 3){
                        addPawnControlledSquare(pawnDirections[7], i);
                    } else {
                        addPawnControlledSquare(pawnDirections[6], i);
                        addPawnControlledSquare(pawnDirections[7], i);
                    }
                    break;
                } case piece.knight: {
                    let validMoves = [];
                    switch (edges[i]){
                        case null:
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
                        if (this.board[j] !== undefined){
                            oppControlledSquares.setBit(j);
                            if (j === (friend | piece.king)){
                                if (inCheck){
                                    inDoubleCheck = true;
                                } else {
                                    inCheck = true;
                                    blockSquares.setBit(i);
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
                        if (this.board[j] !== undefined){
                            oppControlledSquares.setBit(j);
                        }
                    }
                }
            }
        }
 

        const generateSlidingMoves = (homeSquare, directions) => {
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
                    if (this.board[currentSquare + i] === 0){
                        legalMoves.push([homeSquare, currentSquare + i]);
                        currentSquare += i;   
                    } else if (this.board[currentSquare + i] & enemy){
                        legalMoves.push([homeSquare, currentSquare + i]);
                        break;
                    } else {
                        break;
                    }                        
                }
            }
        } 

        const generatePawnMoves = (index) => {

            if (pinnedPieces[index]){
                
                let direction = (this.toMove === 1) ? Math.abs(pinnedPieces[index]) : -Math.abs(pinnedPieces[index])
                switch (direction){
                    case pawnDirections[0]:
                        if (this.board[index + pawnDirections[0]] === 0){
                            legalMoves.addPawnMove(index, index + pawnDirections[0], friend)
                            if (this.board[index + pawnDirections[1]] === 0){
        
                            }
                        }
                        break;
                    case pawnDirections[2]:
                        break;
                    case pawnDirections[3]:
                        break;
                }
            } else {
                if (edges[index] !== 0){
                    if (this.board[index + pawnDirections[3]] & enemy){
                        legalMoves.addPawnMove(index, index + pawnDirections[2], friend);                       
                    }
                }
                if (edges[index] !== 3){
                    if (this.board[index + pawnDirections[2]] & enemy){
                        legalMoves.addPawnMove(index, index + pawnDirections[3], friend)
                    }
                }
                if (this.board[index + pawnDirections[0]] === 0){
                    legalMoves.addPawnMove(index, index + pawnDirections[0], friend)
                    if (this.board[index + pawnDirections[1]] === 0){

                    }
                }
                
            }
        }
        if (!inCheck) { // generate moves while not in check
            for (let i = 0; i < 64; i++){
                switch(this.board[i] ^ friend){
                    case piece.pawn: {

                    } case piece.knight: {
                        
                    } case piece.bishop: {
                        if (pinnedPieces[i]){
                            generateSlidingMoves(i, [pinnedPieces[i], -pinnedPieces[i]])
                        } else {
                            generateSlidingMoves(i, [9, -9, 7, -7]);
                        }
                    } case piece.rook: {

                    } case piece.queen: {

                    } case piece.king:
                        break;
                }
            }
            
            
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
