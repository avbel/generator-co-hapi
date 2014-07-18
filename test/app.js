/*global describe, beforeEach, it */
'use strict';
var path = require('path');
var fs = require('fs');
var generator = require('yeoman-generator');
var helpers = generator.test;
var assert = generator.assert

describe('co-hapi generator', function () {
  beforeEach(function (done) {
    helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
      if (err) {
        return done(err);
      }

      this.app = helpers.createGenerator('co-hapi:app', [
        '../../app'
      ]);
      this.app.options['skip-install'] = true;
      done();
    }.bind(this));
  });

  it('creates expected files', function (done) {
    var expected = [
      'composer.json',
      'package.json',
      '.jshintrc',
      '.editorconfig',
      'test/mocha.opts'
    ];

    helpers.mockPrompt(this.app, {});
    this.app.run({}, function () {
      helpers.assertFile(expected);
      done();
    });
  });

  it('creates index.js if createPlugin is true', function (done) {
    var expected = [
      'composer.json',
      'package.json',
      'index.js',
      'test/mocha.opts'
    ];

    helpers.mockPrompt(this.app, {createPlugin: true});
    this.app.run({}, function () {
      helpers.assertFile(expected);
      done();
    });
  });

  it('fills right options into package.json and composer.json', function (done) {
    helpers.mockPrompt(this.app, {
      cacheEngine: "memory",
      cacheEngineOptions: "{\"test1\": true}",
      host: "my-host",
      port: "8080",
      serverOptions: "{\"serverOptions\": \"test\"}",
      plugins: "foo, bar"
    });
    this.app.run({}, function () {
      var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'package.json'), 'utf8'));
      assert(pkg.dependencies['foo']);
      assert(pkg.dependencies['bar']);
      assert(pkg.dependencies['catbox-memory']);
      var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'composer.json'), 'utf8'));
      assert(config.pack.cache.engine === 'catbox-memory');
      assert(config.pack.cache.test1 === true);
      assert(config.servers[0].host === 'my-host');
      assert(config.servers[0].port === 8080);
      assert(config.servers[0].options);
      assert(config.servers[0].options.serverOptions === 'test');
      assert(config.plugins['foo']);
      assert(config.plugins['bar']);
      done();
    });
  });
});
