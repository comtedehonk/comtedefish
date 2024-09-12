export default class BitBoard extends BigUint64Array{
    constructor(){
        super(1)
    }
    holds(index){
        return Boolean((this[0] >>> BigInt(index)) & 1)
    }
    setBit(index){
        let num = 1n << BigInt(index);
        this[0] = this[0] | num;
    }
    forEachBit(func){
        let num = this[0];
        while (num !== 0n){
            func(index);
            num &= (num - 1n);
        }
    }
}