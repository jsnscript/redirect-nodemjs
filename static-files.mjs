import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);




export default function fileFromRequest(req, res) {

  let URI = req.url.replaceAll('*', '');
  let shortURI = URI.split('?')[0].split('#')[0];

  if (shortURI[shortURI.length - 1] == '/') {
    shortURI = shortURI + 'index.html';
  }


  try {
    let fileLocation = path.join(__dirname, shortURI);
    let file = fs.readFileSync(fileLocation);
    let type = 'text/html';
    try {
      type = mime.lookup(fileLocation) || 'text/html';
    } catch (e) {
      type = 'text/html';
    }

    res.setHeader('content-type', type);
    res.statusCode = 200;
    return res.end(file);
  } catch (e) {
    console.log(e.message);
    res.statusCode = 404;
    return res.end('File not found ' + e.message);
  }


}


