const express = require('express');
// const cors = require('cors');
const app = express();

const port = 3001;

const routes = require('./src/routes/routes');

app.use('/', routes);
// app.use(cors());

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
