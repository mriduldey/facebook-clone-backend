const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const { readdirSync } = require('fs');

dotenv.config();
const app = express();

// ============== cors setup start======================

// allowed sites that can request this facebook-backend server resources
const allowed = ['http://localhost:3000'];

function options(req, res) {
  let tmp;
  let origin = req.header('Origin');
  console.log('origin', origin);
  if (allowed.indexOf(origin) > -1) {
    tmp = {
      origin: true,
      optionSuccessStatus: 200,
    };
  } else {
    tmp = {
      origin: 'stupid',
    };
  }
  res(null, tmp);
}

app.use(cors(options));

// ============== cors setup end ======================

// dynamically create APIs by reading routes directory
readdirSync('./routes').map((r) => app.use('/', require('./routes/' + r)));

const port = process.env || 8000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
