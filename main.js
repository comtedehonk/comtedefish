const chessboard = document.getElementById("chessboard");
const ctx = chessboard.getContext("2d");
import {renderBoard} from "./chessboard/chessboard.js";
import {currentPosition} from "./comtedefish/comtedefish.js"






console.log(innerWidth + "  " + innerHeight)



function draw(){
    renderBoard(ctx);
    requestAnimationFrame(draw);
}

    draw();

    console.log(currentPosition.legalMoves.map((move) => {
        return `${(move >> 6) & 0b111111} to ${move & 0b111111}`;
    }));
    


