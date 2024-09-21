export default class BitBoard extends BigUint64Array {
    constructor(){
        super(1)
    }
    holds(index){
        return Boolean((this[0] >>> BigInt(index)) & 1n)
    }
    setBit(index){
        let num = 1n << BigInt(index);
        this[0] = this[0] | num;
    }
}