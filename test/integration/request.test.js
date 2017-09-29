'use strict';

const assert = require('assert');
const Request = require('../../lib/Request');
const fs = require('fs');
const requestModule = require('request');

describe('Request', function () {
  const postBody = { id: 3, name: 'FooBar', age: 35 };

  it('should post new user', function () {
    const request = new Request('http://localhost:3000');

    request.upon(requestModule);

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
    const request = new Request('http://localhost:3000');

    request.upon(requestModule);

    return request
      .get('/user')
      .json()
      .query({ name: 'FooBar' })
      .then((response) => {
        assert.deepEqual(postBody, response.body[0]);

        return response;
      });
  });

  it('should update user info', function () {
    const request = new Request('http://localhost:3000');

    request.upon(requestModule);

    return request
      .put('/user/:id', { id: 1 })
      .json()
      .body({ age: 20 })
      .then((response) => {
        assert.equal(response.body.age, 20);

        return response;
      });
  });

  it('should get user by id without path parser', function () {
    const request = new Request('http://localhost:3000');

    request.upon(requestModule);

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
    const request = new Request('http://localhost:3000');

    request.upon(requestModule);

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
    const request = new Request('http://localhost:3000');

    request.upon(requestModule);

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
    const options = new Request('http://localhost:3000').get('/image').toOptions();
    const request = require('request'); // eslint-disable-line

    request(options)
      .on('response', (response) => {
        assert.equal(response.statusCode, 200);
        assert.equal(response.headers['content-type'], 'image/png');
      })
      .on('end', done)
      .on('error', done)
      .pipe(fs.createWriteStream('test/fixtures/image_downloaded.png'));
  });

  it('should get image as buffer using request.encoding(null)', function () {
    const request = new Request('http://localhost:3000');

    request.upon(requestModule);

    return request
      .get('/image')
      .encoding(null)
      .then((response) => {
        assert.equal(response.body instanceof Buffer, true);

        return response;
      });
  });

  it('should get image as non-buffer using request.encoding("utf-8")', function () {
    const request = new Request('http://localhost:3000');

    request.upon(requestModule);

    return request
      .get('/image')
      .encoding('utf-8')
      .then((response) => {
        assert.equal(response.body instanceof Buffer, false);

        return response;
      });
  });

  describe('#timeout()', function () {
    it('should timeout request', function () {
      this.timeout(3000);
      const request = new Request('http://localhost:3000');

      request.upon(requestModule);

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
      const request = new Request('http://localhost:3000');

      request.upon(requestModule);

      return request
        .get('/timeout')
        .timeout(2500)
        .then((response) => {
          assert.equal(response.body, 'NO_TIMEOUT');

          return response;
        });
    });
  });

  describe('#jar()', function () {
    it('should send and get cookies', function () {
      const request = new Request('http://localhost:3000');

      request.upon(requestModule);

      const j = request.request.jar();
      const cookie = request.request.cookie('key1=value1');
      const url = 'http://localhost:3000';
      j.setCookie(cookie, url);

      return request
        .get('/cookie')
        .jar(j)
        .then((response) => {
          assert.equal(response.body, 'key1=value1');
          assert.ok(j.getCookieString(url).includes('key2=value2'));

          return response;
        });
    });
  });

  describe('#exec()', function () {
    it('should request stream image with exec and callback', function (done) {
      const request = new Request('http://localhost:3000').get('/image');

      request.upon(requestModule);

      request.exec(() => done())
        .on('response', (response) => {
          assert.equal(response.headers['content-type'], 'image/png');
        })
        .on('error', done);
    });

    it('should request stream image with exec', function (done) {
      const request = new Request('http://localhost:3000').get('/image');

      request.upon(requestModule);

      request.exec()
        .on('response', (response) => {
          assert.equal(response.headers['content-type'], 'image/png');
        })
        .on('end', done)
        .on('error', done);
    });
  });
});
