/*global describe, beforeEach, it */
'use strict';
var path = require('path');
var fs = require('fs');
var generator = require('yeoman-generator');
var helpers = generator.test;
var assert = generator.assert

describe('co-hapi:mongoose generator', function () {
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
      this.app = helpers.createGenerator('co-hapi:mongoose', [
        '../../mongoose',
        '../../add-plugin'
      ]);
      this.app.options['skip-install'] = true;
      app.run({}, done);
    }.bind(this));
  });


  it('fills right options about new plugin into package.json and composer.json', function (done) {
    helpers.mockPrompt(this.app, {
      connectionString: "mongodb://localhost/test"
    });
    this.app.run({}, function () {
      var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'package.json'), 'utf8'));
      assert(pkg.dependencies['co-hapi-mongoose']);
      var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'composer.json'), 'utf8'));
      assert(config.plugins['co-hapi-mongoose']);
      assert(config.plugins['co-hapi-mongoose'].connectionString === "mongodb://localhost/test");
      done();
    });
  });

});
