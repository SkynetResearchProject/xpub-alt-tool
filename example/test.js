const lib = require('@swan-bitcoin/xpub-lib/lib/derivation')
const Purpose = require('@swan-bitcoin/xpub-lib/lib/purpose')
const base58 = require('base-58')


// Common.js and ECMAScript Modules (ESM)
const sha256 = require('@noble/hashes/sha256')
var arr = new Uint8Array([1, 2, 3]);
console.log( sha256.sha256(arr) );

// Uint8Array(32) [3, 144,  88, 198, 242, 192, 203,  73, ...]

console.log(
    lib.addressesFromExtPubKey({
        extPubKey: 'xpub6Co4ndfHC2QpH4wX9drouzPf2SR1PMeZPHDadXJQwMGVPL2siKpdwweoXEt2JjxnzGXgPZcbtYuHPYZpC6wi3as9GdRtx7cRiex1FGEqffE',
        network: "mainnet",
        addressCount: 4,
        purpose: Purpose.Purpose.P2PKH
    })
);

var codedString ='1LKqYaHVUXSXjNy2VRZLfwQrkLARbMWeKL';
var decodedString = base58.decode(codedString);
var buff = new Buffer.from(decodedString);
//console.log(buff.toString('utf8'));

buff[0]=0x19; buff[21]=0;
codedString2= base58.encode(buff);
console.log(codedString2);

