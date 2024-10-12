export const edges = new Uint8Array([
    0, 1, 4, 4, 4, 4, 2 ,3,
    0, 1, 4, 4, 4, 4, 2 ,3,
    0, 1, 4, 4, 4, 4, 2 ,3,
    0, 1, 4, 4, 4, 4, 2 ,3,
    0, 1, 4, 4, 4, 4, 2 ,3,
    0, 1, 4, 4, 4, 4, 2 ,3,
    0, 1, 4, 4, 4, 4, 2 ,3,
    0, 1, 4, 4, 4, 4, 2 ,3
    ]);

export const piece = { 
    
    pawn: 4,  
    knight: 8,
    bishop: 12,
    rook: 16,
    queen: 20, 
    king: 24, // 000 00 (5 bits)

    white: 1, 
    black: 2 
}

export const originalPosition = [
    piece.black | piece.rook, piece.black | piece.knight, piece.black | piece.bishop, piece.black | piece.queen, piece.black | piece.king,piece.black | piece.bishop, piece.black | piece.knight, piece.black | piece.rook,
    piece.black | piece.pawn,  piece.black | piece.pawn,  piece.black | piece.pawn,  piece.black | piece.pawn,  piece.black | piece.pawn,  piece.black | piece.pawn,  piece.black | piece.pawn,  piece.black | piece.pawn,
    0,  0,  0,  0,  0,  0,  0,  0, 
    0,  0,  0,  0,  0,  0,  0,  0, 
    0,  0,  0,  0,  0,  0,  0,  0, 
    0,  0,  0,  0,  0,  0,  0,  0, 
    piece.white | piece.pawn,  piece.white | piece.pawn,  piece.white | piece.pawn,  piece.white | piece.pawn,  piece.white | piece.pawn,  piece.white | piece.pawn,  piece.white | piece.pawn,  piece.white | piece.pawn,
    piece.white | piece.rook, piece.white | piece.knight, piece.white | piece.bishop, piece.white | piece.queen, piece.white | piece.king,piece.white | piece.bishop, piece.white | piece.knight, piece.white | piece.rook,  
];
