const pbkdf2 = require('pbkdf2');
const isJS = require('is_js');
const jwt = require('jsonwebtoken');
const config = require('../utilities/config');

exports.crypto = {
  cryptoSync: plantText => {
    let hashPassword = pbkdf2.pbkdf2Sync(plantText, 'dasdasdasdasdasdasd', 1, 32, 'sha512');
    return hashPassword.toString('hex');
  },
  compareSync: (plantText, hash) => {
    let hashPassword = pbkdf2.pbkdf2Sync(plantText, 'dasdasdasdasdasdasd', 1, 32, 'sha512');
    hashPassword = hashPassword.toString('hex');
    return isJS.equal(hashPassword, hash);
  },
};

exports.getToken = user => {
  const payload = {
    email: user.email,
    id: user._id,
  }

  let token = jwt.sign(payload, config.secretKey, {
    expiresIn: config.tokenSessionTimeout,
  })

  return token;
};

exports.jwtSign = (payload, timeout = config.tokenSessionTimeout) => {
  const signData = {
    email: payload.email,
    name: payload.name,
    active: payload.active,
    role: payload.role
  }
  let token = jwt.sign(signData, config.secretKey, {
    expiresIn: timeout
  });
  return token
}