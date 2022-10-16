const jwt = require('jsonwebtoken');

exports.generateToken = (payload, expire) => {
  return jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: expire,
  });
};
