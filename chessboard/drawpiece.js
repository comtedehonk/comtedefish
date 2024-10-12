import {piece} from "../comtedefish/constants.js";
const pieceSprites = document.getElementById("piece-sprites");
export default function drawPiece(ctx, drawnPiece, file, rank, size){
    let spriteYLocation = 45 - (45 * (drawnPiece & piece.white));
    switch (drawnPiece & 0b11100){
        case piece.pawn:
            var spriteXLocation = 5;
            break;
        case piece.knight:
            var spriteXLocation = 3;
            break;
        case piece.bishop:
            var spriteXLocation = 2;
            break;
        case piece.rook:
            var spriteXLocation = 4;
            break;
        case piece.queen:
            var spriteXLocation = 1;
            break;
        case piece.king:
            var spriteXLocation = 0;
            break;
    }

    ctx.drawImage(pieceSprites, spriteXLocation * 45, spriteYLocation, 45, 45, file * size, rank * size, size, size);
    
}