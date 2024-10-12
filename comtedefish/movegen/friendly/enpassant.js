import pawnState from "../pawnstate.js";
import {edges, piece} from "../../constants.js";
export default function generateEnPassant(position, EPsquare, pinnedPieces, legalMoves, friend, enemy){
    
    square1 = EPsquare - pawnState[friend].pawnMoves[2]; // left
    square2 = EPsquare - pawnState[friend].pawnMoves[3]; // right
    
    function epIsLegal(leftSquare, rightSquare){  // check is enpassant is pseudo-pinned
        let foundKing = false, foundRook = false;
        leftCheck: while (edges[leftSquare] !== 0){
            switch (position.board[leftSquare - 1]){
                case 0:
                    leftSquare--;
                    break;
                case enemy | piece.rook:
                case enemy | piece.queen:
                    foundRook = true;
                    break leftCheck;
                case friend | piece.king:
                    foundKing = true;
                    break leftCheck;
                default:
                    break leftCheck;
            }            
        }

        rightCheck: while (edges[rightSquare] !== 3){
            switch (position.board[rightSquare + 1]){
                case 0:
                    rightSquare++;
                    break;
                case enemy | piece.rook:
                case enemy | piece.queen:
                    foundRook = true;
                    break rightCheck;
                case friend | piece.king:
                    foundKing = true;
                    break rightCheck;
                default:
                    break rightCheck;
            }            
        }

        return (foundKing && foundRook) ? false : true;
    }

    if (square1 === (friend | piece.pawn) && edges[EPsquare] !== 0){
        if ((pinnedPieces[square1] === 0 || Math.abs(pinnedPieces[square1]) === Math.abs(EPsquare - square1))
        && epIsLegal(square1, square1 + 1)){
            legalMoves.addEnPassantMove(square1, EPsquare);
        }
    }
    
    if (square2 === (friend | piece.pawn) && edges[EPsquare] !== 3){
        if ((pinnedPieces[square2] === 0 || Math.abs(pinnedPieces[square2]) === Math.abs(EPsquare - square2))
        && epIsLegal(square2 - 1, square2)){
            legalMoves.addEnPassantMove(square2, EPsquare);
        }
    }
}