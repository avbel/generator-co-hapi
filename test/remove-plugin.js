/*global describe, beforeEach, it */
'use strict';
var path = require('path');
var fs = require('fs');
var generator = require('yeoman-generator');
var helpers = generator.test;
var assert = generator.assert

describe('co-hapi:remove-plugin generator', function () {
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
      this.app = helpers.createGenerator('co-hapi:remove-plugin', [
        '../../remove-plugin'
      ], ['foo']);
      this.app.options['skip-install'] = true;
      app.run({}, done);
    }.bind(this));
  });


  it('removes plugin from package.json and composer.json', function (done) {
    this.app.run({}, function () {
      var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'package.json'), 'utf8'));
      assert(!pkg.dependencies['foo']);
      var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'composer.json'), 'utf8'));
      assert(!config.plugins['foo']);
      done();
    });
  });

});
