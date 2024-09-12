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
