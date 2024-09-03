import { Position } from "./comtedefish.js"
let currentPosition = new Position([
    10,8, 9, 11,12,9, 8, 10,
    7, 7, 7, 7, 7, 7, 7, 7,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 1,
    4, 2, 3, 5, 6, 3, 2, 4
], [true, true, false, false], null, "w");
const pieceSprites = document.getElementById("piece-sprites");
const pieces = [0, [pieceSprites, 5 * 45, 0, 45, 45], [pieceSprites, 3 * 45, 0, 45, 45], [pieceSprites, 2 * 45, 0, 45, 45], [pieceSprites, 4 * 45, 0, 45, 45], [pieceSprites, 1 * 45, 0, 45, 45],
[pieceSprites, 0 * 45, 0, 45, 45], [pieceSprites, 5 * 45, 45, 45, 45], [pieceSprites, 3 * 45, 45, 45, 45], [pieceSprites, 2 * 45, 45, 45, 45], [pieceSprites, 4 * 45, 45, 45, 45],
[pieceSprites, 1 * 45, 45, 45, 45], [pieceSprites, 0 * 45, 45, 45, 45]];
let boardSquares = [];
let boardSize = innerHeight - 73;
chessboard.height = boardSize;
chessboard.width = boardSize;
let squareSize = boardSize / 8;
let mouseX = 0;
let mouseY = 0;
let pickedUpPiece = null;
let perspective = "white";
let legalMovesOverlay = {
    piece: null,
    moves: []
}
// greenyellow #DCE514
// whiteyellow #FAFB34
chessboard.addEventListener("mousemove", (e) => {
    const rect = chessboard.getBoundingClientRect();
    mouseX = e.pageX - 10;
    mouseY = e.pageY - 20;    
})

class Square {
    constructor(index, color, piece){
        this.index = index;
        this.color = color;
        this.piece = piece;
        this.row = Math.floor(this.index / 8);
        this.column = this.index % 8;
    }
    draw(ctx){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.column * squareSize, this.row * squareSize, squareSize, squareSize);
        
        ctx.fillStyle = "black"
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(this.index, this.column * squareSize, (this.row + 1) * squareSize);
        
        if (this.index === legalMovesOverlay.piece){
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = "yellow";
            ctx.fillRect(this.column * squareSize, this.row * squareSize, squareSize, squareSize);
        } else if (legalMovesOverlay.moves.includes(this.index)){
            ctx.globalAlpha = 0.4
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(squareSize * (this.column + 0.5), squareSize * (0.5 + this.row), squareSize/7, squareSize/7, 0, 2*Math.PI);
            ctx.fill();
            ctx.closePath;   
        }        
        ctx.globalAlpha = 1;
        if (this.piece > 0 && this.index !== pickedUpPiece){
            ctx.drawImage(...pieces[this.piece], this.column * squareSize, this.row * squareSize, squareSize, squareSize);
        }
        
    }
}
function initializeBoard(currentBoard){
    boardSquares = [];
    legalMovesOverlay.piece = null;
    legalMovesOverlay.moves = [];
    for (let i = 0; i < 64; i++){
        let color;
        let row = Math.floor(i / 8);
        let column = i % 8;
        if (row % 2 + column % 2 === 1){    
            color = "#739552"   
        } else {
            color = "#EBECD0"
        }
        let piece = currentBoard[i];        
        boardSquares.push(new Square(i, color, piece));
    }
}
    


initializeBoard(currentPosition.currentBoard);

function pickUpPiece(){
    let userFile = Math.floor(mouseX / (squareSize));
    let userRank = Math.floor(mouseY / (squareSize));
    let boardIndex = userRank * 8 + userFile;
    if (perspective === "black"){
        boardIndex = 63 - boardIndex;
    }
    if (currentPosition.isFriendly(currentPosition.currentBoard[boardIndex])){ 
        pickedUpPiece = boardIndex;
        legalMovesOverlay.piece = boardIndex;
        legalMovesOverlay.moves = [];
        for (let i of currentPosition.legalMoves){
            if (pickedUpPiece === i[0]){
                legalMovesOverlay.moves.push(i[1])
            }
            if (pickedUpPiece === currentPosition.currentBoard[currentPosition.friendlyPieces.king]){
                if (i === "O-O"){
                    legalMovesOverlay.moves.push(currentPosition.friendlyPieces.king + 2)
                } else if (i === "O-O-O"){
                    legalMovesOverlay.moves.push(currentPosition.friendlyPieces.king - 3)
                }
            }
        }
    }       
}

chessboard.addEventListener("mousedown", () => {
    pickUpPiece();    
});

const flipBoardButton = document.getElementById("flip-board-button");
flipBoardButton.addEventListener("click", function flipBoard(){
    (perspective === "white") ? perspective = "black" : perspective = "white";    
    drawBoard(chessboard.getContext("2d"));
});

function putDownPiece(){
    if (typeof pickedUpPiece === "number"){
        let userFile = Math.floor(mouseX / (squareSize));
        let userRank = Math.floor(mouseY / (squareSize));
        let boardIndex = userRank * 8 + userFile;
        if (perspective === "black"){
            boardIndex = 63 - boardIndex;
        }

        if (legalMovesOverlay.moves.includes(boardIndex)){
            currentPosition = currentPosition.makeMove(pickedUpPiece, boardIndex);
            console.log("made move " + pickedUpPiece + " to " + boardIndex)
            initializeBoard(currentPosition.currentBoard);
            console.log(currentPosition.legalMoves);
        }

        pickedUpPiece = null;
        
    }
    
}

chessboard.addEventListener("mouseup", () => {
    putDownPiece();
});

export function drawBoard(ctx){
    for (let square of boardSquares){
        square.draw(ctx);
    }
    if (pickedUpPiece !== null){
        ctx.drawImage(...pieces[currentPosition.currentBoard[pickedUpPiece]], mouseX - squareSize/2, mouseY - squareSize/2, squareSize, squareSize);
    }
}