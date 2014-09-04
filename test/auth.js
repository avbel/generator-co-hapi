/*global describe, beforeEach, it */
'use strict';
var path = require('path');
var fs = require('fs');
var generator = require('yeoman-generator');
var helpers = generator.test;
var assert = generator.assert

describe('co-hapi:auth generator', function () {
  beforeEach(function (done) {
    helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
      if (err) {
        return done(err);
      }
      var app = helpers.createGenerator('co-hapi:app', [
        '../../app'
      ]);
      helpers.mockPrompt(app, {
        cacheEngine: "memory",
        cacheEngineOptions: "{\"test1\": true}",
        host: "my-host",
        port: "8080"
      });
      app.options['skip-install'] = true;
      this.app = helpers.createGenerator('co-hapi:auth', [
        '../../auth',
        '../../add-plugin',
      ]);
      this.app.env.store.add('co-hapi:posto', helpers.createDummyGenerator());
      this.app.env.store.add('co-hapi:mongoose', helpers.createDummyGenerator());
      this.app.options['skip-install'] = true;
      app.run({}, done);
    }.bind(this));
  });


  it('fills options right', function (done) {
    helpers.mockPrompt(this.app, {
      useSSL: false,
      minPasswordLength: 7,
      sessionCookie: 'session.id',
      ownViews: false,
      ownEmailTemplates: false,
      externalProviders: ['google', 'facebook']
    });
    this.app.run({}, function () {
      var k, pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'package.json'), 'utf8'));
      assert(pkg.dependencies['co-hapi-auth']);
      assert(pkg.dependencies['co-hapi-models']);
      assert(pkg.dependencies['then-jade']);
      var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'composer.json'), 'utf8'));
      var opts = config.plugins['co-hapi-auth'];
      assert(opts);
      assert(opts.session.cookie === 'session.id');
      assert(opts.session.isSecure === false);
      assert(opts.session.password);
      assert(opts.minPasswordLength === 7);
      var providers = Object.keys(opts.providers).sort();
      assert(providers[0] === 'facebook');
      assert(providers[1] === 'google');
      for(k in opts.providers){
        assert(opts.providers[k].isSecure === false);
      }
      done();
    });
  });
});
