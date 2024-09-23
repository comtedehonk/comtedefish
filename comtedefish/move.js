import {piece} from "./constants.js"

function Move(homeSquare, finalSquare){
    return ((homeSquare << 6) | (finalSquare));
}

function PromotionMove(homeSquare, finalSquare, piece){
    return ((piece << 12) | (homeSquare << 6) | finalSquare);
}

/**

Move - Last 6 bits: final square
next 6: original square
next 8: promotion piece

 */

export class LegalMovesList extends Array {
    addPawnMove(homeSquare, finalSquare, friendly){
        if (finalSquare < 8 || finalSquare > 55){
            this.push(PromotionMove(homeSquare, finalSquare, friendly | piece.knight));
            this.push(PromotionMove(homeSquare, finalSquare, friendly | piece.bishop));
            this.push(PromotionMove(homeSquare, finalSquare, friendly | piece.rook));
            this.push(PromotionMove(homeSquare, finalSquare, friendly | piece.queen));
        } else {
            this.push(Move(homeSquare, finalSquare));
        }
    }
    addMove(homeSquare, finalSquare){
        this.push(Move(homeSquare, finalSquare));
    }
}
