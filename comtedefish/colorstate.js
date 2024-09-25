export default [
    {
        pawnMoves: [-8, -16, -7, -9], // forward, 2 forward, 1 right, 1 left
        enemyPawnMoves: [8, 16, 9, 7],
        onSecondRank: (index) => {
            if (index > 47 && index < 56){
                return true;
            }
        }
    },

    {
        pawnMoves: [-8, -16, -7, -9], // forward, 2 forward, 1 right, 1 left
        enemyPawnMoves: [8, 16, 9, 7],
        onSecondRank: (index) => {
            if (index > 7 && index < 16){
                return true;
            }
        }
    }
]