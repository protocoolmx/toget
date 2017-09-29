'use strict';

const jsonServer = require('json-server');
const fs = require('fs');

before('setup fake server', function (done) {
  // Always go back to original db.json
  fs.writeFileSync('test/fixtures/db.json', fs.readFileSync('test/fixtures/db.original.json'));

  const server = jsonServer.create();
  const router = jsonServer.router('test/fixtures/db.json');
  const middlewares = jsonServer.defaults();

  server.use(middlewares);

  // Add custom routes before JSON Server router
  server.get('/image', function (req, res) {
    res.set('content-type', 'image/png');
    fs.createReadStream('test/fixtures/image.png').pipe(res);
  });

  server.get('/timeout', function (req, res) {
    setTimeout(function () {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('NO_TIMEOUT');
    }, 2000);
  });

  server.get('/cookie', function (req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.cookie('key2', 'value2');
    res.end(req.headers.cookie);
  });

  server.use(router);
  server.listen(3000, () => done());
});
