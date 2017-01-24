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
      .json(true)
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
      .json(true)
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
      .json(true)
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
      .json(true)
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
      .json(true)
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
      .json(true)
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
});
