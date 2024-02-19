const express = require('express');
const app = express();
const port = 3000;

const routes = require('./src/routes/routes');

app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port} ))`);
});