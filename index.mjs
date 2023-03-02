import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;



// Render Html File
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});


app.listen(port, () => {
  // Code.....
})