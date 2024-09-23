export const edges = [
    0, 1, null, null, null, null, 2 ,3,
    0, 1, null, null, null, null, 2 ,3,
    0, 1, null, null, null, null, 2 ,3,
    0, 1, null, null, null, null, 2 ,3,
    0, 1, null, null, null, null, 2 ,3,
    0, 1, null, null, null, null, 2 ,3,
    0, 1, null, null, null, null, 2 ,3,
    0, 1, null, null, null, null, 2 ,3
    ];

export const piece = { 
    /*  
    Piece representation in byte array, each type = 1 bit
    8 different types = one byte
    */
    white: 1, 
    black: 2, 
    pawn: 4,  
    knight: 8,
    bishop: 16,
    rook: 32,  
    queen: 64, 
    king: 128  
}

export const originalPosition = [
    34, 10, 18, 66, 130,18, 10, 34,
    6,  6,  6,  6,  6,  6,  6,  6,
    0,  0,  0,  0,  0,  0,  0,  0, 
    0,  0,  0,  0,  0,  0,  0,  0, 
    0,  0,  0,  0,  0,  0,  0,  0, 
    0,  0,  0,  0,  0,  0,  0,  0, 
    5,  5,  5,  5,  5,  5,  5,  5,
    33, 9,  17, 65, 129,17, 9,  33  
]
