/*global describe, beforeEach, it */
'use strict';
var path = require('path');
var fs = require('fs');
var generator = require('yeoman-generator');
var helpers = generator.test;
var assert = generator.assert

describe('co-hapi:posto generator', function () {
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
      this.app = helpers.createGenerator('co-hapi:posto', [
        '../../posto',
        '../../add-plugin'
      ]);
      this.app.options['skip-install'] = true;
      app.run({}, done);
    }.bind(this));
  });


  it('fills right options for Mailgun api', function (done) {
    helpers.mockPrompt(this.app, {
      transport: 'mailgun api',
      mailgunApiKey: '111',
      mailgunDomain: 'domain'
    });
    this.app.run({}, function () {
      var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'package.json'), 'utf8'));
      assert(pkg.dependencies['posto']);
      assert(pkg.dependencies['nodemailer-mailgunapi-transport']);
      var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'composer.json'), 'utf8'));
      var opts = config.plugins['posto'];
      assert(opts);
      assert(opts.transport === 'nodemailer-mailgunapi-transport');
      assert(opts.transportOptions.apiKey === '111');
      assert(opts.transportOptions.domain === 'domain');
      done();
    });
  });

  it('fills right options for SMTP (with predefined service)', function (done) {
    helpers.mockPrompt(this.app, {
      transport: 'smtp',
      smtpService: 'Gmail',
      smtpUser: 'user',
      smtpPass: 'password'
    });
    this.app.run({}, function () {
      var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'package.json'), 'utf8'));
      assert(pkg.dependencies['posto']);
      assert(pkg.dependencies['nodemailer-smtp-transport']);
      var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'composer.json'), 'utf8'));
      var opts = config.plugins['posto'];
      assert(opts);
      assert(opts.transport === 'nodemailer-smtp-transport');
      assert(opts.transportOptions.service === 'Gmail');
      assert(opts.transportOptions.auth.user === 'user');
      assert(opts.transportOptions.auth.pass === 'password');
      done();
    });
  });

  it('fills right options for SMTP (with custom service)', function (done) {
    helpers.mockPrompt(this.app, {
      transport: 'smtp',
      smtpService: 'custom',
      smtpHost: 'host',
      smtpPort: 444,
      smtpSecure: false,
      smtpUser: 'user',
      smtpPass: 'password'
    });
    this.app.run({}, function () {
      var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'package.json'), 'utf8'));
      assert(pkg.dependencies['posto']);
      assert(pkg.dependencies['nodemailer-smtp-transport']);
      var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'composer.json'), 'utf8'));
      var opts = config.plugins['posto'];
      assert(opts);
      assert(opts.transport === 'nodemailer-smtp-transport');
      assert(!opts.transportOptions.service);
      assert(opts.transportOptions.host === 'host');
      assert(opts.transportOptions.port === 444);
      assert(opts.transportOptions.secure === false);
      assert(opts.transportOptions.auth.user === 'user');
      assert(opts.transportOptions.auth.pass === 'password');
      done();
    });
  });

  it('fills right options for another transport', function (done) {
    helpers.mockPrompt(this.app, {
      transport: 'another',
      anotherTransportModule: 'test-transport',
      anotherTransportOptions: '{\"option1\": 10}'
    });
    this.app.run({}, function () {
      var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'package.json'), 'utf8'));
      assert(pkg.dependencies['posto']);
      assert(pkg.dependencies['test-transport']);
      var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'composer.json'), 'utf8'));
      var opts = config.plugins['posto'];
      assert(opts);
      assert(opts.transport === 'test-transport');
      assert(opts.transportOptions.option1 === 10);
      done();
    });
  });

});
