import {piece} from "./constants.js"
export class Move {
    constructor(square1, square2){
        this.square1 = square1;
        this.square2 = square2;
    }
}

export class PromotionMove extends Move {
    constructor(square1, square2, promotionPiece){
        super(square1, square2);
        this.promotionPiece = promotionPiece;
    }
}

export class LegalMovesList extends Array {
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
