const CryptoJS = require("crypto-js");

const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const algorithm = 'aes-256-cbc', key = "3A25F657805B3A6F0B1EB4AB8357304D", iv = "DA1738F8838F6C7A1F6DD16243FD23B4";

module.exports = function (app, cb) {

  var api = {};

  api.encrypt = async function (text) {
    const newKey = Buffer.from(key);
    const newIv  = Buffer.from(iv.substring(0, 16));

    let cipher  = crypto.createCipheriv(algorithm, newKey, newIv);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');

    return crypted;
  };

  api.decrypt = async function (text) {
    const newKey = Buffer.from(key);
    const newIv  = Buffer.from(iv.substring(0, 16));

    let decipher  = crypto.createDecipheriv(algorithm, newKey, newIv);
    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  };

  api.encryptJS = async function (text, replace = false) {
    const ciphertext = CryptoJS.AES.encrypt(text, key, { iv });
    const hash = ciphertext.toString() || '';
    return (replace) ? hash.replaceAll('+', 'xMl3Jk').replaceAll('/', 'Por21Ld').replaceAll('=', 'Ml32') : hash;
  };

  api.decryptJS = async function (text, replace = false) {
    if (replace) text = (text || '').replaceAll('xMl3Jk', '+').replaceAll('Por21Ld', '/').replaceAll('Ml32', '=');
    const bytes = CryptoJS.AES.decrypt(text, key, { iv });
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  api.createToken = function ({ dsemail, dstipo }) {
    try {
      return jwt.sign({ dsemail, dstipo }, key, { expiresIn: '1h' });
    } catch (err) { throw err; }
  }

  api.verifyToken = function ({ token }) {
    try {
      return jwt.verify(token, key, (err, decoded) => (err) ? err : decoded);
    } catch (err) { throw err; }
  }

  return api;

};