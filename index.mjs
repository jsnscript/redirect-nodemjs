import fetch from 'node-fetch';
import http from 'http';
import fileFromRequest from './static-files.mjs';
import addCorsHeaders from './cors-headers.mjs';

let hostTarget = 'replit.com';
let hostList = [];
hostList.push(hostTarget);

http.createServer(onRequest).listen(3000);

async function onRequest(req, res) {
try{
  const hostProxy = req.headers['host'];


  if (req.url == '/ping') {
    res.statusCode = 200;
    return res.end();
  }

  res = addCorsHeaders(res);

  let path = req.url.replaceAll('*', '');
  let pat = path.split('?')[0].split('#')[0];

  if (pat == '/link-resolver.js') {

    return fileFromRequest(req, res);

  }



  req.headers.host = hostTarget;
  req.headers.referer = hostTarget;


  /* start reading the body of the request*/
  let bdy = "";
  req.on('readable', function() {
    bdy += req.read();
  });

req.promise = new Promise((resolve, reject) => {
req.resolve = resolve;
});

  req.on('end', req.resolve);
  await req.promise;
    /* finish reading the body of the request*/

    /* start copying over the other parts of the request */
    let options = {
      method: req.method,
      headers: req.headers
    };
    /* fetch throws an error if you send a body with a GET request even if it is empty */
    if ((req.method != 'GET') && (req.method != 'HEAD') && (bdy.length > 0)) {
      options = {
        method: req.method,
        headers: req.headers,
        body: bdy
      };
    }
    /* finish copying over the other parts of the request */

    /* fetch from your desired target */
    let response = await fetch('https://' + hostTarget + path, options);

    /* if there is a problem try redirecting to the original */
    if (response.status > 399) {
      res.setHeader('location', 'https://' + hostTarget + path);
      res.statusCode = 302;
      return res.end();
    }


    /* copy over response headers  */

    for (let [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }
    for (let [key, value] of response.headers.keys()) {
      if (key.length > 1) {
        res.removeHeader(key);
        res.setHeader(key, value);
      }
    }

    res.removeHeader('content-encoding');
    res.removeHeader('content-length');

    res = addCorsHeaders(res);

    /* check to see if the response is not a text format */
    let ct = response.headers.get('content-type');



    res.setHeader('content-type', ct);

    if ((ct) && (!ct.includes('image')) && (!ct.includes('video')) && (!ct.includes('audio'))) {


      /* Copy over target response and return */
      let resBody = await response.text();

      let resNewBody = resBody.replace('<head>',
        `<head modified>
                                <script src="https://`+ hostProxy + `/link-resolver.js" host-list="` + btoa(JSON.stringify(hostList)) + `"></script>`);
      return res.end(resNewBody);


    } else {

      /* if not a text response then redirect straight to target */
      res.setHeader('location', 'https://' + hostTarget + path);
      res.statusCode = 301;
      return res.end();

    }
  
}catch(e){

res.statusCoded = 500;
return res.end('500 '+e?.message);   
    
}

}
