const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const { readdirSync } = require('fs');

dotenv.config();

// stop plurarizing schemas | without it schema "User" will take only "users" as collection
mongoose.pluralize(null);
const app = express();
app.use(express.json());
// ============== cors setup start======================

// allowed sites that can request this facebook-backend server resources
const allowed = ['http://localhost:3000'];

function options(req, res) {
  let tmp;
  let origin = req.header('Origin');
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

//database connect
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    dbName: 'facebook',
  })
  .then(() => console.log('Databse connected successfully'))
  .catch((err) => console.log(err.message));

// Run facebook-clone server
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
