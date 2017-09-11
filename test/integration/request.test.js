'use strict';

const assert = require('assert');
const tutils = require('../fixtures/tutils');
const Request = require('../../lib/request');
const request = require('request');
const fs = require('fs');

describe('Request', function () {

  let db;
  let postBody = { id: 3, name: 'FooBar', age: 35 };

  before('get server db', function () {
    return tutils.db().then(data => (db = data));
  });

  it('should post new user', function () {
    let request = new Request('http://localhost:3000');

    return request
      .post('/user')
      .body(postBody)
      .json()
      .then((response) => {
        assert.ok(response.headers['content-type']);
        assert.ok(response.headers['content-type'].search(/json/));
        assert.deepEqual(response.body, postBody);

        return response;
      });
  });

  it('should get user by name', function () {
    let request = new Request('http://localhost:3000');

    return request
      .get('/user')
      .json()
      .query({name: 'FooBar'})
      .then((response) => {
        assert.deepEqual(postBody, response.body[0]);

        return response;
      });
  });

  it('should update user info', function () {
    let request = new Request('http://localhost:3000');

    return request
      .put('/user/:id', { id: 1 })
      .json()
      .body({age: 20})
      .then((response) => {
        assert.equal(response.body.age, 20);

        return response;
      });
  });

  it('should get user by id without path parser', function () {
    let request = new Request('http://localhost:3000');

    return request
      .get('/user/3')
      .json()
      .then((response) => {
        assert.ifError(response.error);
        assert.equal(response.statusCode, 200);
        assert.equal(response.type, 2);
        assert.equal(response.ok, true);
        assert.equal(response.status.ok, true);

        assert.equal(response.body.id, 3);

        return response;
      });
  });

  it('should delete user by id', function () {
    let request = new Request('http://localhost:3000');

    return request
      .delete('/user/:id', { id: 1 })
      .json()
      .then((response) => {
        assert.ifError(response.error);
        assert.ok(response.ok);

        return response;
      });
  });

  it('should return error 404 for user', function () {
    let request = new Request('http://localhost:3000');

    return request
      .get('/user/-1')
      .json()
      .then((response) => {
        assert.equal(response.statusCode, 404);
        assert.equal(response.type, 4);
        assert.equal(response.status.notFound, true);
        assert.equal(response.clientError, true);

        return response;
      });
  });

  it('should get image using request.toOptions() with request', function (done) {

    let options = new Request('http://localhost:3000').get('/image').toOptions();

    request(options)
    .on('response', function(response) {
      assert.equal(response.statusCode, 200);
      assert.equal(response.headers['content-type'], 'image/png');
    })
    .on('end', done)
    .on('error', done)
    .pipe(fs.createWriteStream('test/fixtures/image_downloaded.png'));
  });

  it('should get image as buffer using request.encoding(null)', function () {

    let request = new Request('http://localhost:3000');

    return request
      .get('/image')
      .encoding(null)      
      .then((response) => {       

        assert.equal(response.body instanceof Buffer , true);

        return response;
      });
  });

   it('should get image as non-buffer using request.encoding("utf-8")', function () {

    let request = new Request('http://localhost:3000');

    return request
      .get('/image')
      .encoding('utf-8')      
      .then((response) => {       

        assert.equal(response.body instanceof Buffer , false);

        return response;
      });
  });

  describe('#timeout()', function () {

    it('should timeout request', function () {
      this.timeout(3000);
      let request = new Request('http://localhost:3000');
      
      return request
        .get('/timeout')
        .timeout(1000)
        .catch((error) => {
          assert.equal(error.code, 'ESOCKETTIMEDOUT');

          return error;
        });
    });

    it('should NOT timeout request', function () {
      this.timeout(3000);
      let request = new Request('http://localhost:3000');
      
      return request
        .get('/timeout')
        .timeout(2500)
        .then((response) => {
          assert.equal(response.body, 'NO_TIMEOUT');

          return response;
        });
    });
  });

  describe.only('#jar()', function () {
    it('should send and get cookies', function () {
      let request = new Request('http://localhost:3000');

      const j = request.request.jar();
      const cookie = request.request.cookie('key1=value1');
      const url = 'http://localhost:3000';
      j.setCookie(cookie, url);

      return request
        .get('/cookie')
        .jar(j)
        .then((response) => {
          assert.equal(response.body, 'key1=value1')
          assert.ok(j.getCookieString(url).includes('key2=value2'));

          return response;
        });
    });
  });

  describe('#exec()', function () {

    it('should request stream image with exec and callback', function (done) {
      let request = new Request('http://localhost:3000').get('/image');

      request.exec((err, response, body) => {
        return done();
      })
      .on('response', (response) => {
        assert.equal(response.headers['content-type'], 'image/png');
      })
      .on('error', done);
    });

    it('should request stream image with exec', function (done) {
      let request = new Request('http://localhost:3000').get('/image');

      request.exec()
      .on('response', (response) => {
        assert.equal(response.headers['content-type'], 'image/png');
      })
      .on('end', done)
      .on('error', done);
    });
  });
});
