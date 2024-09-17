let log2map = new Map();
for (let i = 0n; i < 64n; i = i + 1n){
    log2map.set(1n << i, Number(i));
}
export default class BitBoard extends BigUint64Array {
    constructor(){
        super(1)
        this.bitsLength = 0;
    }
    holds(index){
        return Boolean((this[0] >>> BigInt(index)) & 1n)
    }
    setBit(index){
        let num = 1n << BigInt(index);
        this[0] = this[0] | num;
        this.bitsLength++;
    }
    forEachBit(func){
        let num = this[0];
        while (num !== 0n){
            let rightMostBit = num & -num
            let index = log2map.get(rightMostBit);
            func(index);
        }
    }
}