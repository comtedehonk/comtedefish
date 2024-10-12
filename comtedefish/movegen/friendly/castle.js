export default function generateCastling(index, position, legalMoves, oppControlledSquares, castleRights){
    
    if (castleRights & 0b10){
        if (position.board[index - 1] + position.board[index - 2] + position.board[index - 3] +
        +oppControlledSquares.holds(index - 1) + +oppControlledSquares.holds(index - 2) === 0){
            legalMoves.addCastleMove(index, index - 2, 0b10);
        }
    }

    if (castleRights & 1){
        if (position.board[index + 1] + position.board[index + 2] +
        +oppControlledSquares.holds(index + 1) + +oppControlledSquares.holds(index + 2) === 0){
            legalMoves.addCastleMove(index, index + 2, 1);
        }
    }
    
}