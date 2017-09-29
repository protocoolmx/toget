'use strict';

const Request = require('./lib/Request');

module.exports = function toget(request) {
  return host => (path, obj) => {
    if (path) {
      return new Request(host).upon(request).get(path, obj);
    }

    return new Request(host).upon(request);
  };
};
