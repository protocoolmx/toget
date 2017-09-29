'use strict';

const Request = require('./lib/request');

module.exports = function toget(host) {
  return (path, obj) => {
    if (path) {
      return new Request(host).get(path, obj);
    }

    return new Request(host);
  };
};
