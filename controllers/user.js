const User = require('../models/User');
const {
  validateEmail,
  validateLength,
  validateUsername,
} = require('../helpers/validation');
const bcrypt = require('bcrypt');
const { generateToken } = require('../helpers/tokens');
const { sendVerificationMail } = require('../helpers/mailer');

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      username,
      bYear,
      bMonth,
      bDay,
      gender,
    } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email address format',
      });
    }

    const check = await User.findOne({ email });
    if (check) {
      return res.status(400).json({
        message:
          'The email address already exist. Try with a different address',
      });
    }

    if (!validateLength(first_name, 3, 30)) {
      return res.status(400).json({
        message: 'First name should be between 3 and 30 characters',
      });
    }

    if (!validateLength(last_name, 3, 30)) {
      return res.status(400).json({
        message: 'Last name should be between 3 and 30 characters',
      });
    }

    if (!validateLength(password, 6, 40)) {
      return res.status(400).json({
        message: 'Password must be atleast 6 character',
      });
    }

    const cryptedPassword = await bcrypt.hash(password, 15);

    const tempUsername = first_name + last_name;
    const newUsername = await validateUsername(tempUsername);

    const user = await new User({
      first_name,
      last_name,
      email,
      password: cryptedPassword,
      username: newUsername,
      bYear,
      bMonth,
      bDay,
      gender,
    }).save();

    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      '30m'
    );

    console.log('token', emailVerificationToken);
    res.json(user);

    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationMail(user.email, user.first_name, url);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};
