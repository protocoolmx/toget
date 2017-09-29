'use strict';

const url = require('url');
const pathToRegexp = require('path-to-regexp');
const Response = require('./Response');

class Request {

  constructor(base) {
    if (!base) {
      throw new Error('"base" must be defined!');
    }

    // Create empty options object to be built for request.
    this._options = {};

    // Init urlObject from given base.
    this.urlObject = url.parse(base);

    // Override default values for urlObject.
    this.urlObject.hash = null;
    this.urlObject.search = null;
    this.urlObject.query = null;
    this.urlObject.pathname = '/';
    this.urlObject.path = '/';
    this.urlObject.href = null;
  }

  /**
   * @param {String} method - request http method.
   * @param {String} path - urlObject.path to be passed to url.format(urlObject).
   * @param {Object} obj - Path Object to parse with pathToRegexp.
   */
  _methodPath(method, path, obj) {
    this._options.method = method;
    this.urlObject.pathname = path;

    if (obj && typeof obj === 'object') {
      this.pathObject = obj;
    }
  }

  _buildOptions() {
    // Make sure to not overbuilt options Object.
    if (this._optionsBuilt) {
      return;
    }

    // If `this.pathObject` is defined then parse it against this.urlObject.pathname.
    if (this.pathObject) {
      const toPath = pathToRegexp.compile(this.urlObject.pathname);
      this.urlObject.pathname = toPath(this.pathObject);
    }

    // If method is not of POST or PUT type then remove body from options.
    if (!['POST', 'PUT'].some(method => method === this._options.method)) {
      delete this._options.body;
    }

    // Set request URL.
    this._options.url = url.format(this.urlObject);

    this._optionsBuilt = true;
  }

  _checkRequestModule() {
    if (!this.request) {
      throw Error('Request#upon() must be called first with request module');
    }
  }

  /**
   * Appen `request` module.
   *
   * @param {Object} request
   * @memberof Request
   */
  upon(request) {
    this.request = request;

    return this;
  }

  /**
   * Build request with options Object and returns Promise.
   *
   * @return {Promise}
   */
  toPromise() {
    this._checkRequestModule();

    // Make sure to not overdefined promise.
    if (!this._promise) {
      // Build request promise.
      this._promise = new Promise((resolve, reject) => {
        this.request(this.toOptions(), (err, response) => {
          if (err) {
            return reject(err);
          }

          // If url and method are not set on response then set them.
          response.url = response.url || this._options.url;
          response.method = response.method || this._options.method;

          return resolve(new Response(response));
        });
      });
    }

    return this._promise;
  }

  /**
   * @return {Object} Valid options Object ready to be passed in request.
   */
  toOptions() {
    if (!this._optionsBuilt) {
      this._buildOptions();
    }

    return this._options;
  }

  /**
   * Make a normal request with `this._options` and return request instance.
   *
   * @param {Function} [cb] - Callback for request.
   * @return {Object} request instance.
   */
  exec(cb) {
    this._checkRequestModule();

    return this.request(this.toOptions(), cb);
  }

  /**
   * Execute request, return promise and gets resolved with response.
   */
  then(cb) {
    return this.toPromise().then(cb);
  }

  /**
   * Execute request, returns a promise and gets rejected with error.
   */
  catch(cb) {
    return this.toPromise().catch(cb);
  }

  /**
   * Set request as GET and passes path.
   */
  get(path, obj) {
    this._methodPath('GET', path, obj);

    return this;
  }

  /**
   * Set request as POST and passes path.
   */
  post(path, obj) {
    this._methodPath('POST', path, obj);

    return this;
  }

  /**
   * Set request as PUT and passes path.
   */
  put(path, obj) {
    this._methodPath('PUT', path, obj);

    return this;
  }

  /**
   * Set request as DELETE and passes path.
   */
  delete(path, obj) {
    this._methodPath('DELETE', path, obj);

    return this;
  }

  /**
   * Query string to be build using: url.format(urlObject).
   *
   * @see https://nodejs.org/dist/latest-v4.x/docs/api/url.html
   */
  query(qs) {
    this.urlObject.query = qs;

    return this;
  }

  /**
   * Appends collection of headers to request options Object.
   *
   * @desc HTTP headers.
   *
   * @param {Object} values - key-value Object of headers.
   */
  headers(values) {
    this._options.headers = values || {};

    return this;
  }

  /**
   * Appends json as `true` to request options Object.
   *
   * @desc Sets body to JSON representation of value and adds
   * Content-type: application/json header. Additionally, parses the response
   * body as JSON.
   */
  json() {
    this._options.json = true;

    return this;
  }

  /**
   * Appends gzip as `true` to request options Object.
   *
   * @desc Add an Accept-Encoding header to request compressed content
   * encodings from the server and decode supported content encodings in the
   * response.
   *
   * Note: Automatic decoding of the response content is performed on the body
   * data returned through request (both through the request stream and passed
   * to the callback function) but is not performed on the response stream
   * (available from the response event) which is the unmodified
   * http.IncomingMessage object which may contain compressed data.
   *
   * @return {Request}
   */
  gzip() {
    this._options.gzip = true;

    return this;
  }

  /**
   * Integer containing the number of milliseconds to wait for a server to send
   * response before aborting the request.
   *
   * @param {number} value - Milliseconds before timing out request.
   * @return {Request}
   */
  timeout(value) {
    this._options.timeout = value;

    return this;
  }

  /**
   * Define your custom cookie jar.
   *
   * @param {object} value - Cookie jar returned by `request.jar()`.
   * @return {Request}
   */
  jar(value) {
    this._options.jar = value;

    return this;
  }

  /**
   * Appends body to request options Object.
   *
   * @param {Bufer|String|ReadStream} data - Entity body for POST and PUT
   * requests (If json is true, then body must be a JSON-serializable object).
   */
  body(data) {
    this._options.body = data;

    return this;
  }

  /**
   * Set encoding to response body.
   *
   * @param {Object} value - Code for encoding response body. If value is null,
   * the body is returned as a Buffer otherwise the response body is encoding
   * with the code from value.
   */
  encoding(value) {
    this._options.encoding = value;

    return this;
  }
}

module.exports = Request;
