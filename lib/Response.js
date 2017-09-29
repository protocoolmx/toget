'use strict';

const statusCodes = JSON.parse(require('fs').readFileSync(`${__dirname}/statusCodes.json`));

class Response {

  constructor(rawResponse) {
    // Make raw response available in response.
    this.rawResponse = rawResponse;

    // Get body, headers and statusCode exactly like it is in response.
    this.body = rawResponse.body;
    this.headers = rawResponse.headers;
    this.statusCode = rawResponse.statusCode;

    // Read dictionary of status codes from lib/statusCodes.json
    // and set false|true values depending on statusCode from response.
    this.status = {};
    Object.keys(statusCodes).forEach((code) => {
      this.status[statusCodes[code]] = this.statusCode === parseInt(code, 10);
    });

    // Make url and method used in request available in response.
    this.url = rawResponse.url;
    this.method = rawResponse.method;
  }

  /**
   * @return {Number} Status range type code (1, 2, 3, 4, 5, etc).
   */
  get type() {
    return Math.floor(this.statusCode / 100);
  }

  /**
   * Status code range from 100 to 199.
   *
   * @return {Boolean}
   */
  get info() {
    return this.type === 1;
  }

  /**
   * Status code range from 200 to 299.
   *
   * @return {Boolean}
   */
  get ok() {
    return this.type === 2;
  }

  /**
   * Status code range from 400 to 499.
   *
   * @return {Boolean}
   */
  get clientError() {
    return this.type === 4;
  }

  /**
   * Status code range from 500 to 599.
   *
   * @return {Boolean}
   */
  get serverError() {
    return this.type === 5;
  }

  /**
   * Response error, false if no error or Error|Object instance otherwise.
   *
   * @return {Error|Object|Boolean} Possible error data.
   */
  get error() {
    if (this.clientError || this.serverError) {
      if (this.body) {
        return this.body;
      }

      return new Error(`Response got ${statusCodes[this.statusCode] || this.type}`);
    }

    return false;
  }
}

module.exports = Response;
