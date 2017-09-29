# toget

[![npm version](https://badge.fury.io/js/toget.svg)](https://badge.fury.io/js/toget) [![Build Status](https://travis-ci.org/protocoolmx/toget.svg?branch=master)](https://travis-ci.org/protocoolmx/toget)

Simple Node.js RESTful API builder for [request](https://github.com/request/request).

## Install

```
$ npm install toget --save
$ npm install request --save
```

**Note:** [request](https://github.com/request/request) 2+ required.

## Overview

**toget** makes available through its API the most used properties of [request](https://github.com/request/request).

```javascript
const toget = require('toget')(require('request'));

// All request made with `request` instance will have
// `http://domain.com` as base URL.
let request = toget('http://domain.com');

request('/user/:id', { id: 1 })
.then((response) => {
  console.log(response.body);
})
.catch((err) => {
  console.trace(err);
});
```

## Request API

`Request` is the class in charge to build and execute requests.

```javascript
const Request = require('toget/lib/Request');
```

#### constructor(base)

Creates `Request` instance.

+ `base` (String) - **protocol+auth+hostname+port** to be taken as base for request.

```javascript
let request = new Request('http://localhost:3000');

// Set request module for API to work.
request.upon(require('request'));
```

#### .get(path, params)

Set request `method`, `path` and optional `params`.

+ `path` (String) - The pathname property consists of the entire path section of the URL.
+ `params` (Object) - Possible object to replace values in path.

**Note:** The same for `.post()`, `.put()` and `.delete()` methods.

```javascript
request.get('/user/:id', { id: 1 })
```

#### .query(qs)

Used to specify query string with an Object.

+ `qs` (Object) - Object to be parsed into a URL query string.

```javascript
request.query({ sort: 'createdAt DESC' })
```

#### .headers(values)

Set HTTP request headers.

+ `values` (Object) - HTTP Headers as Object to be append in request.

```javascript
request.headers({ 'Accept-Encoding': 'gzip, deflate' })
```

#### .json()

Adds `Content-type: application/json` header and parses the response body as JSON.

```javascript
request.json()
```

#### .gzip()

Add an Accept-Encoding header to request compressed content encodings from the
server and decode supported content encodings in the response.

```javascript
request.gzip()
```

#### .jar(value)

Define your custom cookie jar.

```javascript
const url = 'http://localhost';
const req = new Request(url);
const j = req.request.jar();
j.setCookie(req.request.cookie('key1=value1'), url);

request.jar(j)
```

#### .timeout(value)

Integer containing the number of milliseconds to wait for a server to send response
before aborting the request.

```javascript
request.timeout(1500)
```

#### .body(data)

Entity body for POST and PUT requests.

+ `data` (Buffer|ReadStream|String|Object) - Entity body.

**Note:** If json is true, then body must be a JSON-serializable object.

```javascript
request.body({ firstName: 'Foo', lastName: 'Bar', age: 25 })
```

#### .encoding(value)

Set encoding code to the response body.

+ `value` (Object) - Represent the enconding code.

**Note:** If value is `undefined` means this is 'utf-8' by default. In the case for `null` is used as encoding code, 
the body is returned as a Buffer.

```javascript
request.encoding('utf-8')
```

#### .toPromise()

Make request and returns Promise instance to handle response and possible errors.

```javascript
request.toPromise()
.then((response) => {
  console.log(response.body);
})
.catch(console.error);
```

**Note:** `response` resolved in promise is an instance of `Response`.

#### .toOptions()

Returns request options Object ready to be used in request(options).

```javascript
request.get('/user').toOptions(); // { method: 'GET', url: 'http://localhost:3000/user' }
```

#### .exec(cb)

Shortcut for `request(req.get('/user').toOptions(), cb)` to use as a normal
request call. This method returns [request](https://github.com/request/request)
instance.

+ `cb` (Function) - Callback as specified in [request](https://github.com/request/request) docs; request(options, **callback**).

```javascript
request.get('/doodle.png').exec((err, response, body) => {
  if (err) {
    console.error(err);
    return;
  }

  // ...
})
.pipe(fs.createWriteStream('doodle.png'));
```

**Note:** The callback here is handled by request so this means `response` is
not the `response` you would expect returned by a promise but the
`response.rawResponse` instead.

## Response API

`Response` is the class in charge to handle response from request made.

```javascript
const Response = require('toget/lib/Response');
```

#### constructor(rawResponse)

Creates `Response` instance.

+ `rawResponse` (Object) - Response Object received in request callback.

```javascript
let request = new Response(rawResponse);
```

#### .body `Buffer|ReadStream|String`

Response body extracted from `rawResponse.body`.

```javascript
response.body
```

#### .headers `Object`

Response headers extracted from `rawResponse.headers`.

```javascript
response.headers
```

#### .statusCode `Number`

Response status code extracted from `rawResponse.statusCode`.

```javascript
response.statusCode
```

#### .url `String`

URL used in request.

```javascript
response.url
```

Method used in request (GET, POST, PUT, DELETE).

#### .method `String`

```javascript
response.method
```

#### .status `Object`

Response status code dictionary available as string-boolean as defined in [statusCodes.json](lib/statusCodes.json)

```javascript
response.status
```

#### .type `Number`

Response status range type code (1, 2, 3, 4, 5, etc).

```javascript
response.type
```

#### .info `Boolean`

Response status code range from 100 to 199.

```javascript
response.info
```

#### .ok `Boolean`

Response status code range from 200 to 299.

```javascript
response.ok
```

#### .clientError `Boolean`

Response status code range from 400 to 499.

```javascript
response.clientError
```

#### .serverError `Boolean`

Response status code range from 500 to 599.

```javascript
response.serverError
```

#### .error `Error|Object|Boolean`

Response error, false if no error or Error|Body instance otherwise.

```javascript
if (response.error) {
  throw response.error;
}
```

## Test

```
$ npm test
```

## License

MIT
