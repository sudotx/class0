const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const middlewares = require('./middlewares');
const api = require('./routes');

require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Hello World',
  });
});

app.use('/api/v1', api);

app.use('*', (req, res) => {
  res.status(404).json({
    message: '🔍 - Endpoint Not Found',
  });
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
