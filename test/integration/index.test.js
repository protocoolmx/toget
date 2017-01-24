'use strict';

const assert = require('assert');
const toget = require('../../index');
const tutils = require('../fixtures/tutils');

describe('toget', function () {

  const request = toget('http://localhost:3000');
  let db;

  before('get server db', function () {
    return tutils.db().then(data => (db = data));
  });

  it('should get array using default get', function () {
    return request('/user')
    .json(true)
    .then((response) => {
      assert.ok(response.headers['content-type']);
      assert.ok(response.headers['content-type'].search(/json/));
      assert.ok(Array.isArray(response.body));

      return response;
    });
  });

  it('should get object using default get', function () {
    return request('/user/:id', { id: 1 })
    .json(true)
    .then((response) => {
      assert.deepEqual(response.body, db.user[0]);

      return response;
    });
  });

  it('should get request options', function () {
    let options = {
      method: 'PUT',
      json: true,
      body: { age: 40 },
      headers: { authorization: 'w6et7iyuhljhbgvjchf' },
      url: 'http://localhost:3000/user/123?key=value'
    };

    let req = request()
                .put('/user/:id', { id: 123 })
                .json(true)
                .body({ age: 40 })
                .query({ key: 'value'})
                .headers({ authorization: 'w6et7iyuhljhbgvjchf' });

    assert.deepEqual(req.toOptions(), options);
  });

  it('should get clean options object (only url defined)', function () {
    assert.deepEqual(request().toOptions(), { url: 'http://localhost:3000/' });
  });
});
