"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.accountDerivationPath = accountDerivationPath;
exports.fullDerivationPath = fullDerivationPath;
exports.partialKeyDerivationPath = partialKeyDerivationPath;
exports.humanReadableDerivationPath = humanReadableDerivationPath;
Object.defineProperty(exports, "APOSTROPHE", {
  enumerable: true,
  get: function get() {
    return _constants.APOSTROPHE;
  }
});

var _unchainedBitcoin = require("unchained-bitcoin");

var _utils = require("./utils");

var _validation = require("./validation");

var _purpose = require("./purpose");

var _constants = require("./constants");

/**
 * This module defines functions to construct valid BIP32 derivation paths.
 *
 * @module paths
 */

/**
 * Construct a partial key derivation path from a given `accountNumber` and `keyIndex`.
 *
 * @param  {number} [accountNumber=0] - the unhardened account number
 * @param  {number} [keyIndex=0] - the unhardened key index
 *
 * @returns {string} a partial derivation path
 */
function partialKeyDerivationPath(_ref) {
  var _ref$accountNumber = _ref.accountNumber,
      accountNumber = _ref$accountNumber === void 0 ? 0 : _ref$accountNumber,
      _ref$keyIndex = _ref.keyIndex,
      keyIndex = _ref$keyIndex === void 0 ? 0 : _ref$keyIndex;

  if ((0, _validation.isValidIndex)(accountNumber) && (0, _validation.isValidIndex)(keyIndex)) {
    return [accountNumber, keyIndex].join(_constants.SEPARATOR);
  }

  return undefined;
}
/**
 * Construct an account derivation path given a `purpose` and an `accountNumber`.
 *
 * @param  {string} [coinPrefix=COIN_PREFIX] - the coin prefix, defaulting to "m" for bitcoin
 * @param  {module:purpose~Purpose} purpose - the derivation purpose
 * @param  {NETWORK} [network=NETWORKS.TESTNET] - the target network (TESTNET or MAINNET)
 * @param  {number} accountNumber - the account number, starting with 0
 *
 * @returns {string} the account derivation path, e.g. "m/44'/0'/3'"
 */


function accountDerivationPath(_ref2) {
  var _ref2$coinPrefix = _ref2.coinPrefix,
      coinPrefix = _ref2$coinPrefix === void 0 ? _constants.COIN_PREFIX : _ref2$coinPrefix,
      purpose = _ref2.purpose,
      _ref2$network = _ref2.network,
      network = _ref2$network === void 0 ? _unchainedBitcoin.NETWORKS.TESTNET : _ref2$network,
      accountNumber = _ref2.accountNumber;
  return [coinPrefix, (0, _utils.harden)(purpose), (0, _utils.harden)(network === _unchainedBitcoin.NETWORKS.MAINNET ? 840 : 1), (0, _utils.harden)(accountNumber)].join(_constants.SEPARATOR);
}
/**
 * Construct a full derivation path as defined by BIP44 given `purpose`,
 * `accountNumber`, and `keyIndex`.
 *
 * @param  {string} [coinPrefix=COIN_PREFIX] - the coin prefix, defaulting to "m" for bitcoin
 * @param  {module:purpose~Purpose} purpose - derivation purpose
 * @param  {NETWORK} [network=NETWORKS.TESTNET] - target network (TESTNET or MAINNET)
 * @param  {number} accountNumber - the account number, starting with 0
 * @param  {number} [change=0] - change (0 = external chain, 1 = internal chain / change)
 * @param {number} keyIndex - the key index, i.e. the number of the key that
 * should be derived from the extended public key
 *
 * @returns  {string} the full derivation path, e.g. "m/44'/0'/3'/0/1"
 */


function fullDerivationPath(_ref3) {
  var _ref3$coinPrefix = _ref3.coinPrefix,
      coinPrefix = _ref3$coinPrefix === void 0 ? _constants.COIN_PREFIX : _ref3$coinPrefix,
      purpose = _ref3.purpose,
      _ref3$network = _ref3.network,
      network = _ref3$network === void 0 ? _unchainedBitcoin.NETWORKS.TESTNET : _ref3$network,
      accountNumber = _ref3.accountNumber,
      _ref3$change = _ref3.change,
      change = _ref3$change === void 0 ? 0 : _ref3$change,
      keyIndex = _ref3.keyIndex;
  return [accountDerivationPath({
    purpose: purpose,
    accountNumber: accountNumber,
    network: network,
    coinPrefix: coinPrefix
  }), change, keyIndex].join(_constants.SEPARATOR);
}
/**
 * Return a human-readable string for a BIP32 derivation path.
 *
 * @param  {string} bip32Path - a BIP32 derivation path
 * @param {string} [accountString="Account"] - the string to display before the
 * account number
 *
 * @example
 * humanReadableDerivationPath("m/49'/0'/2'/0/1")
 * // --> "Account #3 (SegWit)"
 *
 * @returns {string} a human readable derivation path
 */


function humanReadableDerivationPath(_ref4) {
  var bip32Path = _ref4.bip32Path,
      _ref4$accountString = _ref4.accountString,
      accountString = _ref4$accountString === void 0 ? "Account" : _ref4$accountString;
  var pathSegments = bip32Path.split(_constants.SEPARATOR);
  var purpose = pathSegments[1].replace(_constants.APOSTROPHE, "");
  var account = Number(pathSegments[3].replace(_constants.APOSTROPHE, "")) + 1;
  return "".concat(accountString, " #").concat(account, " (").concat(_purpose.AccountTypeName[purpose], ")");
}
