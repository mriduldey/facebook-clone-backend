const jwt = require('jsonwebtoken');

const { SECRET_KEY } = process.env;

exports.generateToken = (payload, expire) => {
  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: expire,
  });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};
