 var sha256 = require("@noble/hashes/sha256");
 var ripemd160 = require("@noble/hashes/ripemd160");
 var bs58 = require('base-58')

/* MPW constants */
 const pubKeyHashNetworkLen = 21;
 const pubChksum = 4;
 const pubPrebaseLen = pubKeyHashNetworkLen + pubChksum;

"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addressFromExtPubKey = addressFromExtPubKey;
exports.addressesFromExtPubKey = addressesFromExtPubKey;

var bitcoin = _interopRequireWildcard(require("bitcoinjs-lib"));

var _unchainedBitcoin = require("unchained-bitcoin");

var _paths = require("./paths");

var _validation = require("./validation");

var _conversion = require("./conversion");

var _purpose = require("./purpose");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * This module defines functions for address derivation.
 *
 * @module derivation
 */

/**
 * Default network to use for address derivation.
 *
 * @constant
 * @type {string}
 * @default NETWORKS.TESTNET
 * */
var DEFAULT_NETWORK = _unchainedBitcoin.NETWORKS.TESTNET;
/**
 * Default purpose to use for address derivation.
 *
 * @constant
 * @type {string}
 * @default Purpose.P2WPKH
 * */


/**
   @returns {Uint8Array} double sha256 or the buffer
 */

function dSHA256(buff) {
    return sha256.sha256(sha256.sha256(new Uint8Array(buff)));
}

// Writes a sequence of Array-like bytes into a location within a Uint8Array
function writeToUint8(arr, bytes, pos) {
    const arrLen = arr.length;
    // Sanity: ensure an overflow cannot occur, if one is detected, somewhere in MPW's state could be corrupted.
    if (arrLen - pos - bytes.length < 0) {
        const strERR =
            'CRITICAL: Overflow detected (' +
            (arrLen - pos - bytes.length) +
            '), possible state corruption, backup and refresh advised.';
        createAlert('warning', strERR, 5000);
        throw Error(strERR);
    }
    let i = 0;
    while (pos < arrLen) arr[pos++] = bytes[i++];
}

/**
 * Compress an uncompressed Public Key in byte form
 * @param {Array<Number> | Uint8Array} pubKeyBytes - The uncompressed public key bytes
 * @returns {Array<Number>} The compressed public key bytes
 */
function compressPublicKey(pubKeyBytes) {
    if (pubKeyBytes.length != 65)
        throw new Error('Attempting to compress an invalid uncompressed key');
    const x = pubKeyBytes.slice(1, 33);
    const y = pubKeyBytes.slice(33);

    // Compressed key is [key_parity + 2, x]
    return [y[31] % 2 === 0 ? 2 : 3, ...x];
}

/**
 * Derive a Secp256k1 network-encoded public key (coin address) from public key bytes
 * @param {String} [options.pubKeyBytes] - An array of bytes containing the compressed public key bytes.
 * @return {String} the public key with the specified encoding
 */
function deriveOneAddress(pubKeyBytes) {
    if (pubKeyBytes.length === 65) {
        pubKeyBytes = compressPublicKey(pubKeyBytes);
    }

    if (pubKeyBytes.length != 33) {
        throw new Error('Invalid public key');
    }
     //console.log("1_pubkey ",pubKeyBytes);
    // First pubkey SHA-256 hash
    const pubKeyHashing = sha256.sha256(new Uint8Array(pubKeyBytes));
    //console.log("pubKeyHashing ",pubKeyHashing);
    // RIPEMD160 hash
    const pubKeyHashRipemd160 = ripemd160.ripemd160(pubKeyHashing);

    // Network Encoding
    const pubKeyHashNetwork = new Uint8Array(pubKeyHashNetworkLen);

    pubKeyHashNetwork[0] = 25;//cChainParams.current.PUBKEY_ADDRESS;  //<-- SKYR

    writeToUint8(pubKeyHashNetwork, pubKeyHashRipemd160, 1);

    // Double SHA-256 hash
    const pubKeyHashingSF = dSHA256(pubKeyHashNetwork);

    // Checksum
    const checksumPubKey = pubKeyHashingSF.slice(0, 4);

    // Public key pre-base58
    const pubKeyPreBase = new Uint8Array(pubPrebaseLen);
    writeToUint8(pubKeyPreBase, pubKeyHashNetwork, 0);
    writeToUint8(pubKeyPreBase, checksumPubKey, pubKeyHashNetworkLen);

    // Encode as Base58 human-readable network address
    return bs58.encode(pubKeyPreBase);
}

var DEFAULT_PURPOSE = _purpose.Purpose.P2WPKH;
/**
 * Derive a single address from a public key.
 *
 * @param {module:purpose~Purpose} purpose - the purpose dictates the derived
 * address type (P2PKH = 1address, P2SH = 3address, P2WPKH = bc1address)
 * @param  {object} pubkey - the ECPair.publicKey public key to derive from
 * @param  {NETWORK} network - the network to use (MAINNET or TESTNET)
 *
 * @returns {object|undefined} derived address
 */

function deriveAddress(_ref) {
  var purpose = _ref.purpose,
      pubkey = _ref.pubkey,
      network = _ref.network;
  //console.log("pubkey ",pubkey);

  switch (purpose) {
    case _purpose.Purpose.P2PKH:
      {
        //var _bitcoin$payments$p2p = bitcoin.payments.p2pkh({
        //  pubkey: pubkey,
        //  network: (0, _unchainedBitcoin.networkData)(network)
        //}),
            //oneAddress = _bitcoin$payments$p2p.address;
            oneAddress = deriveOneAddress(pubkey);

        return oneAddress;
      }
/*
    case _purpose.Purpose.P2SH:
      {
        var _bitcoin$payments$p2s = bitcoin.payments.p2sh({
          redeem: bitcoin.payments.p2wpkh({
            pubkey: pubkey,
            network: (0, _unchainedBitcoin.networkData)(network)
          })
        }),
            threeAddress = _bitcoin$payments$p2s.address;

        return threeAddress;
      }

    case _purpose.Purpose.P2WPKH:
      {
        var _bitcoin$payments$p2w = bitcoin.payments.p2wpkh({
          pubkey: pubkey,
          network: (0, _unchainedBitcoin.networkData)(network)
        }),
            bc1Address = _bitcoin$payments$p2w.address;

        return bc1Address;
      }
*/
    default:
      return undefined;
  }
}
/**
 * Derive a single address from a given extended public key. Address type is
 * defined by the `purpose` parameter.
 *
 * @param  {string} extPubKey - the extended public key
 * @param  {number} accountNumber - the account number, starting with 0
 * @param  {number} [keyIndex=0] - the unhardened key index
 * @param  {module:purpose~Purpose} [purpose=DEFAULT_PURPOSE] - the derivation purpose
 * @param  {NETWORK} [network=DEFAULT_NETWORK] - the target network (TESTNET or MAINNET)
 *
 * @returns {object|undefined} derived address
 */


function addressFromExtPubKey(_ref2) {
  var extPubKey = _ref2.extPubKey,
      _ref2$accountNumber = _ref2.accountNumber,
      accountNumber = _ref2$accountNumber === void 0 ? 0 : _ref2$accountNumber,
      _ref2$keyIndex = _ref2.keyIndex,
      keyIndex = _ref2$keyIndex === void 0 ? 0 : _ref2$keyIndex,
      _ref2$purpose = _ref2.purpose,
      purpose = _ref2$purpose === void 0 ? DEFAULT_PURPOSE : _ref2$purpose,
      _ref2$network = _ref2.network,
      network = _ref2$network === void 0 ? DEFAULT_NETWORK : _ref2$network;

  if (!(0, _validation.isValidIndex)(accountNumber) || !(0, _validation.isValidIndex)(keyIndex) || !(0, _validation.isValidPurpose)(purpose) || !(0, _validation.isValidExtPubKey)(extPubKey, network)) {
    return undefined;
  }

  var partialPath = (0, _paths.partialKeyDerivationPath)({
    accountNumber: accountNumber,
    keyIndex: keyIndex
  });
  var fullPath = (0, _paths.fullDerivationPath)({
    purpose: purpose,
    accountNumber: accountNumber,
    keyIndex: keyIndex,
    network: network
  });
  var convertedExtPubKey = (0, _conversion.convertToXPUB)(extPubKey, network);
  var childPubKey = (0, _unchainedBitcoin.deriveChildPublicKey)(convertedExtPubKey, partialPath, network);
  var keyPair = bitcoin.ECPair.fromPublicKey(Buffer.from(childPubKey, "hex"));
  var pubkey = keyPair.publicKey;
  return {
    path: fullPath,
    address: deriveAddress({
      purpose: purpose,
      pubkey: pubkey,
      network: network
    })
  };
}
/**
 * Derive multiple addresses from a given extended public key.
 * See {@link module:derivation~addressFromExtPubKey}.
 *
 * @param  {string} extPubKey - the extended public key
 * @param  {number} accountNumber - the account number, starting with 0
 * @param  {number} [keyIndex=0] - the unhardened key index
 * @param  {module:purpose~Purpose} [purpose=DEFAULT_PURPOSE] - the derivation purpose
 * @param  {NETWORK} [network=DEFAULT_NETWORK] - the target network (TESTNET or MAINNET)
 *
 * @returns {object[]} array of derived addresses
 */


function addressesFromExtPubKey(_ref3) {
  var extPubKey = _ref3.extPubKey,
      addressCount = _ref3.addressCount,
      _ref3$accountNumber = _ref3.accountNumber,
      accountNumber = _ref3$accountNumber === void 0 ? 0 : _ref3$accountNumber,
      _ref3$purpose = _ref3.purpose,
      purpose = _ref3$purpose === void 0 ? DEFAULT_PURPOSE : _ref3$purpose,
      _ref3$network = _ref3.network,
      network = _ref3$network === void 0 ? DEFAULT_NETWORK : _ref3$network;
  var addresses = [];

  for (var keyIndex = 0; keyIndex < addressCount; keyIndex += 1) {
    var _addressFromExtPubKey = addressFromExtPubKey({
      extPubKey: extPubKey,
      accountNumber: accountNumber,
      keyIndex: keyIndex,
      purpose: purpose,
      network: network
    }),
        path = _addressFromExtPubKey.path,
        address = _addressFromExtPubKey.address;

    addresses.push({
      path: path,
      address: address
    });
  }

  return addresses;
}
