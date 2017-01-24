'use strict';

const jsonServer = require('json-server');
const fs = require('fs');

before('setup fake server', function (done) {

  // Always go back to original db.json
  fs.writeFileSync('test/fixtures/db.json', fs.readFileSync('test/fixtures/db.original.json'));

  let server = jsonServer.create();
  let router = jsonServer.router('test/fixtures/db.json');
  let middlewares = jsonServer.defaults();

  server.use(middlewares);

  // Add custom routes before JSON Server router
  server.get('/image', function (req, res) {
    res.set('content-type', 'image/png');
    fs.createReadStream('test/fixtures/image.png').pipe(res);
  });

  server.use(router);
  server.listen(3000, () => {
    return done();
  });
});
