#! /usr/bin/env node
var rsa = require("node-bignumber");
var crypto = require('crypto');
var node_cryptojs = require('node-cryptojs-aes');

var CryptoJS = node_cryptojs.CryptoJS;
var JsonFormatter = node_cryptojs.JsonFormatter;

// 
// keyData is in the form:
// modulus: <hex string of public key modulus>
// publicExponent: <public exponent for keys> 
// privateExponent: <hex string of private key exponenent>
//
// Use 'openssl rsa -in privkey.pem -text -noout' to display
// the above values from pem file.
// 
function WorkerEncryption(keyData) {
  this.keyData = keyData;
}

WorkerEncryption.prototype = {
  encrypt: function(data) {
    var symmetricKey = crypto.randomBytes(128);
    var symmetricKeyB64 = symmetricKey.toString("base64");
    console.log('encrypting: ' + data + ' using symmetric key:');
    console.log(symmetricKeyB64);
    var encryptedData = CryptoJS.AES.encrypt(data, symmetricKeyB64, { format: JsonFormatter });
    console.log('encrypted data: ' + encryptedData);
    var pubkey = new rsa.Key();
    pubkey.setPublic(this.keyData.modulus, this.keyData.publicExponent);
    var encryptedSymmetricKey = pubkey.encrypt(symmetricKeyB64);
    console.log('encrypted symmetric key: ' + encryptedSymmetricKey);
    var response = {};
    response["data"] = encryptedData.toString();
    response["symmetricKey"] = encryptedSymmetricKey;
    return response;
  },

  decrypt: function(input) {
    var encryptedSymmetricKey = input["symmetricKey"];
    var encryptedData = input["data"];
    
    console.log('decrypting symmetric key: ' + encryptedSymmetricKey);
    var privkey = new rsa.Key();
    privkey.setPrivate(this.keyData.modulus,
                       this.keyData.publicExponent,
                       this.keyData.privateExponent);
    var decriptedSymmetricKey = privkey.decrypt(encryptedSymmetricKey);
    console.log('decrypted symmetric key: ' + decriptedSymmetricKey);
    
    console.log('decrypting data: ' + encryptedData);
    var decryptedData = CryptoJS.AES.decrypt(encryptedData, decriptedSymmetricKey, { format: JsonFormatter });
    console.log('decrypted data: ' + decryptedData);
    return CryptoJS.enc.Utf8.stringify(decryptedData);
  }
}

module.exports = WorkerEncryption;

