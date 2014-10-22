#! /usr/bin/env node

var WorkerEncryption = require('./workerEncryption');

/*
 * This code does the following:
 * 
 * 1) Get pem file from command-line argument
 * 2) Instantiate WorkerEncryption supplying pem file (eventually,
 *    WorkerEncryption object should get contents of pem from 'registry')
 * 2a) WorkeryEncryption object gets private key from pem file
 * 2b) WorkeryEncryption object gets public key from pem file
 * 3) Get data to encrypt from command-line argument
 * 4) Use WorkerEncryption object to encrypt data
 * 4a) WorkeryEncryption creates symmetric key, encrypts data using symmetric
 *     key, then encrypts symmetric key with public key, returns encrypted data
 *     and encrypted symmetric key.  
 * 5) Print to console unencrypted and encrypted data
 * 6) Use WorkerEncryption object to decrypt data (pass data and encrypted
 *    symmetric key)
 * 6a) WorkerEncryption decryptes symmetric key using private key then decrypts
 *     data using symmetric key.
 * 7) Print to console decrypted data   
 */

var keyData = {
  'modulus': 'A9D5211080D3F35BB9573EE23E63A9868D98E859FBDD511184B19D6388FF5FFA9B1F55BAE4E6F21788A362DBD947A54F55D5CF3B8DF4CF97FB9D3F4F3BC411CB5664723D5206DBE0587BA18B9EB433C6B450AAB5DE924B5D843D1C6872DA459E849754DE8DE240B3C3E6733568AB81933649669272FF666D218FC26E99E8A8753714DC4AA907A60001D8E3D2E236A68776733EE5377FB264D4801C70024F3915D14B97E430B156A90A6F20D60846D546803C43BDAA694B84ED510C1D13E68D84274C49212CBC30CE16280DEBD2B8274F6E1982A2FC7E3AE1F538BA33712FDD111262DAD0720E4B9380F5B1DCD4D12480B9EF9885AAF6C454D3D8251E41A17B81', 
  'publicExponent': '10001',
  'privateExponent': 'a533a2f430bcfbeeef7d44b8434422f5b5eb55a9a26c889d67dc76630a329024709cac821e83e05eb0156ee6b8970ee0fb77fe1bca5ca74b0a00ce42beba5d2cd49ee4d96d5f2aa732ab205b7647884df3bcbc32298d592e60a2296e18bae619ea94628412b451880c39b13bf4d35039e906c17617d304c9876a16120c38db1383b4350eb6af1d4124593cad4af68421b57f8768297bd1f80899bf78d19345b73199cfc48a7979db822e979e2145f24e8398c2158fc4b3462e8e0f1821701a955e3e738b0708ca3760da409b39dd3c847929889a6e39943f41191798417c6f82d3c401515407058af6f0e309a93545bf2db596142e851cb1794115bdd01f8801'
}; 

var workerEncryption = new WorkerEncryption(keyData);

var message = 'It\'s supposed to be the summer or George!';

var encryptResponse = workerEncryption.encrypt(message);
console.log('--- Response from encrypt ---');
console.log('encrypted data: ' + encryptResponse.data);
console.log('encrypted symmetric key: ' + encryptResponse.symmetricKey);
console.log('--- End response from encrypt ---');

var decryptedMessage = workerEncryption.decrypt(encryptResponse);
console.log('decrypted message: ' + decryptedMessage);
