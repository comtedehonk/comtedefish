import {Position} from "../comtedefish/comtedefish.js";
import {originalPosition} from "../comtedefish/constants.js";
import drawPiece from "./drawpiece.js";
const chessboard = document.getElementById("chessboard");
let boardSize = innerHeight - 73;
chessboard.height = boardSize;
chessboard.width = boardSize;
let squareSize = boardSize / 8;

let currentPosition = new Position(new Uint8Array(originalPosition), 0b00000000000011110);
let renderCalls = [];

class SquareRenderCall {
    constructor(color, file, rank){
        this.color = color;
        this.file = file;
        this.rank = rank;
    }

    get piority(){
        return 0;
    }

    render(ctx){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.file * squareSize, this.rank * squareSize, squareSize, squareSize);
        ctx.fillStyle = "black";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(this.file + this.rank * 8, this.file * squareSize, (this.rank + 1) * squareSize);
    }
}

class pieceRenderCall {

    constructor(piece, file, rank){
        this.piece = piece;
        this.file = file;
        this.rank = rank;
    }

    get piority(){
        return 100;
    }

    render(ctx){
        drawPiece(ctx, this.piece, this.file, this.rank, squareSize);
    }
}


// greenyellow #DCE514
// whiteyellow #FAFB34

let currentBoard = [];

class Square {    
    constructor(index, piece){
        this.index = index;
        this.piece = piece;
    }

    get file(){
        return this.index % 8;
    }

    get rank(){
        return Math.floor(this.index / 8);
    }

    get color(){
        if (this.rank % 2 + this.file % 2 === 1){    
            return "#739552";
        } else {
            return "#EBECD0";
        }
    }

    render(){
        renderCalls.push(new SquareRenderCall(this.color, this.file, this.rank));
        if (this.piece) renderCalls.push(new pieceRenderCall(this.piece, this.file, this.rank));
    }
}

function initBoard(board){
    for (let i = 0; i < 64; i++){
        currentBoard.push(new Square (i, currentPosition.board[i]));
    }
};

initBoard();

for (let i = 0; i < 64; i++){
    currentBoard[i].render();
}

renderCalls.sort((a, b) => a.piority - b.piority);


console.log(renderCalls)
export function renderBoard(ctx){
    for (let i in renderCalls){
        renderCalls[i].render(ctx);
    }
}