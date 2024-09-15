import edges from "../constants.js"
export const generateSlidingMoves = (homeSquare, directions, position, legalMoves) => {
    for (let i of directions){
        let currentSquare = homeSquare;
        let edge;
        switch (i){ 
            case -9:
            case  7:
            case -1:
                edge = 0;
                break;
            case 1:
            case -7:
            case 9:
                edge = 3;
                break;                                            
        }
        
        while (edges[currentSquare] !== edge){
            if (this.board[currentSquare + i] === 0){
                legalMoves.push([homeSquare, currentSquare + i]);
                currentSquare += i;   
            } else if (this.board[currentSquare + i] & enemy){
                legalMoves.push([homeSquare, currentSquare + i]);
                break;
            } else {
                break;
            }                        
        }
    }
}