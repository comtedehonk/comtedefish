const chessboard = document.getElementById("chessboard");
const ctx = chessboard.getContext("2d");
import {drawBoard} from "./chessboard2.js"
import {currentPosition} from "./comtedefish/comtedefish.js"






console.log(innerWidth + "  " + innerHeight)

function draw(){
    drawBoard(ctx);
    requestAnimationFrame(draw);
}

    draw();
    console.log(currentPosition.legalMoves);
    


