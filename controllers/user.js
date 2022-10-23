const User = require('../models/User');
const {
  validateEmail,
  validateLength,
  validateUsername,
} = require('../helpers/validation');
const bcrypt = require('bcrypt');
const { generateToken, verifyToken } = require('../helpers/tokens');
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

    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationMail(user.email, user.first_name, url);

    const token = generateToken({ id: user._id.toString() }, '7d');

    res.send({
      id: user._id,
      first_name,
      last_name,
      username: user.username,
      picture: user.picture,
      verified: user.verified,
      token,
      message: 'Register Success! Please activate your email to start',
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

// fetches the token from the verification-mail account-activation URL
// and verifies it.
exports.activateAccount = async (req, res) => {
  try {
    const { token } = req.body;
    const user = verifyToken(token);
    const fullUser = await User.findById(user.id);
    if (fullUser.verified === true) {
      return res.status(400).json({ message: 'Account is already verified' });
    } else {
      await User.findByIdAndUpdate(user.id, { verified: true });
      return res
        .status(200)
        .json({ message: 'Account has been activated successfully' });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //check if user exist with this email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: 'The email is not connected to an account' });
    }

    // check if password entered by user is correct
    const isPassValid = await bcrypt.compare(password, user.password);
    if (!isPassValid) {
      return res
        .status(400)
        .json({ message: 'Invalid Credentials. Please try again' });
    }

    // generate token if all verification is fine and send the response with the token
    const token = generateToken({ id: user._id.toString() }, '7d');

    res.send({
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      picture: user.picture,
      verified: user.verified,
      token,
      message: 'Login Success! Please activate your email to start',
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};
