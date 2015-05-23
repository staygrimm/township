var qs = require('querystring');
var response = require('response');
var JSONStream = require('JSONStream');
var jsonBody = require('body/json');
var through = require('through2');
var filter = require('filter-object');
var extend = require('extend');

module.exports = function (server) {
  var prefix = '/api/v1.0/';

  server.router.on(prefix + '/posts/', function (req, res, opts) {
    server.authorize(req, res, function (authError, authAccount) {
      var notAuthorized = (authError || !authAccount);

      if (req.method === 'GET') {
        server.posts.get(opts.params.postkey, function (err, post) {
          if (err) return errorResponse(res, 500, 'Server error')
          var stream = format(post, { outputKey: 'comments' })
          server.comments.find('post', opts.params.postkey)
            .pipe(stream)
            .pipe(JSONStream.stringify())
            .pipe(res)
        })
      }

      if (req.method === 'POST') {
        if (notAuthorized) return errorResponse(res, 401, 'Not Authorized')

        jsonBody(req, res, function (err, body) {
          server.posts.create(body, function (err, res) {
            if (err) return errorResponse(res, 500, 'Server error')
            return response().json(body).pipe(res)
          })
        })
      }
    })
  })

  server.router.on(prefix + '/posts/:key', function (req, res, opts) {
    server.authorize(req, res, function (authError, authAccount) {
      if (req.method === 'GET') {
        server.posts.get(opts.params.key, function (err, res) {
          if (err) return errorResponse(res, 500, 'Server error')

          return response().json(body).pipe(res)
        })
      }

      if (req.method === 'PUT') {
        if (notAuthorized) return errorResponse(res, 401, 'Not Authorized')

        jsonBody(req, res, function (err, body) {
          server.posts.update(opts.params.key, body, function (err, res) {
            if (err) return errorResponse(res, 500, 'Server error')
            return response().json(body).pipe(res)
          })
        })
      }

      if (req.method === 'DELETE') {
        if (notAuthorized) return errorResponse(res, 401, 'Not Authorized')

        server.posts.delete(opts.params.key, function (err, res) {
          if (err) return errorResponse(res, 500, 'Server error')
          return response().json(body).pipe(res)
        })
      }
    })
  })
}