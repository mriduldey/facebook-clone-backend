const User = require('../models/User');

exports.validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,12})(\.[a-z]{2-12})?$/);
};

exports.validateLength = (text, min, max) => {
  return text.length >= min && text.length <= max;
};

// check if exist in db else return the new username
exports.validateUsername = async (username) => {
  let check;
  do {
    check = await User.findOne({ username });
    if (check) {
      //change username
      username += (new Date() * Math.random()).toString().substring(0, 1);
      console.log('in validation', username);
    }
  } while (check);
  return username;
};
