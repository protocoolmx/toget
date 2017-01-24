# toget

Simple Node.js RESTful API builder for [request](https://github.com/request/request).

## Install

```
$ npm install toget --save
```

## Overview

**toget** makes available through his API the most used properties of [request](https://github.com/request/request).

```javascript
const toget = require('toget');

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
let Request = require('toget/lib/request');
```

#### constructor(base)

Creates `Request` instance.

+ `base` (String) - **protocol+auth+hostname+port** to be taken as base for request.

```javascript
let request = new Request('http://localhost:3000');
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

#### .body(data)

Entity body for POST and PUT requests.

+ `data` (Buffer|ReadStream|String|Object) - Entity body.

**Note:** If json is true, then body must be a JSON-serializable object.

```javascript
request.body({ firstName: 'Foo', lastName: 'Bar', age: 25 })
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

Shortcut for `request(req.get('/user').toOptions(), cb)`.

+ `cb` (Function) - Callback as specified in [request](https://github.com/request/request) docs; request(options, **callback**).

```javascript
request.get('/user').exec((err, response, body) => {
  if (err) {
    console.error(err);
    return;
  }

  // ...
});
```

**Note:** The callback here is handled by request so this means `response` is
not the `response` you would expect returned by a promise but the
`response.rawResponse` instead.

## test

```
$ npm test
```

## License

MIT
