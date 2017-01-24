'use strict';

const fs = require('fs');

module.exports = {
  db: () => {
    return new Promise((resolve, reject) => {
      fs.readFile('test/fixtures/db.json', 'utf-8', (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(JSON.parse(data));
      });
    });
  }
};
