/*global describe, beforeEach, it */
'use strict';
var path = require('path');
var fs = require('fs');
var generator = require('yeoman-generator');
var helpers = generator.test;
var assert = generator.assert

describe('co-hapi:add-plugin generator', function () {
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
        port: "8080",
        serverOptions: "{\"serverOptions\": \"test\"}",
        plugins: "foo, bar"
      });
      app.options['skip-install'] = true;
      this.app = helpers.createGenerator('co-hapi:add-plugin', [
        '../../add-plugin'
      ], ['my-plugin']);
      this.app.options['skip-install'] = true;
      app.run({}, done);
    }.bind(this));
  });


  it('fills right options about new plugin into package.json and composer.json', function (done) {
    helpers.mockPrompt(this.app, {
      url: "",
      opts: "{\"test1\": true}"
    });
    this.app.run({}, function () {
      var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'package.json'), 'utf8'));
      assert(pkg.dependencies['my-plugin']);
      var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'composer.json'), 'utf8'));
      assert(config.plugins['my-plugin']);
      assert(config.plugins['my-plugin'].test1 === true);
      done();
    });
  });

  it('fills plugin url if it specifed', function (done) {
    helpers.mockPrompt(this.app, {
      url: "http://my-host",
      opts: "{\"test1\": true}"
    });
    this.app.run({}, function () {
      var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'package.json'), 'utf8'));
      assert(pkg.dependencies['my-plugin'] == "http://my-host");
      done();
    });
  });
});
