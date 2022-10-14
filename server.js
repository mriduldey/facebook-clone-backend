const express = require('express');
const cors = require('cors');

const app = express();

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

app.get('/', (req, res) => {
  res.send('Welcome home');
});

app.listen(8000, () => console.log('Server is listening on port 8000'));
