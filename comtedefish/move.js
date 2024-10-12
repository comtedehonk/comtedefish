import {piece} from "./constants.js"

function Move(homeSquare, finalSquare){
    return ((homeSquare << 6) | (finalSquare));
}

function PromotionMove(homeSquare, finalSquare, piece){
    return ((piece << 12) | (homeSquare << 6) | finalSquare);
}

function enPassantMove(homeSquare, finalSquare){
    return ((1 << 19) | (homeSquare << 6) | (finalSquare));
}

function Castle(homeSquare, finalSquare, side){
    return ((side << 17) | (homeSquare << 6) | (finalSquare));
}
/**

Move - Last 6 bits: final square
next 6: original square
next 5: promotion piece
next 2: castle (01 king, 10 queen)
next 1: en passant
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

    addEnPassantMove(homeSquare, finalSquare){
        this.push(enPassantMove(homeSquare, finalSquare));
    }
    
    addCastleMove(homeSquare, finalSquare, side){
        this.push(Castle(homeSquare, finalSquare, side));
    }
}
