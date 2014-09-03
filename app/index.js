'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var async = require('async');


var CoHapiGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = require('../package.json');
    this.on('error', function(err){
      console.log(chalk.bold.red(err));
      process.exit(1);
    });
    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
    });
  },

  askFor: function () {
    var done = this.async();

    this.log(yosay('Welcome to hapi application generator with power of co and ES6 generators!'));

    var prompts = [{
      type: 'list',
      name: 'cacheEngine',
      choices: ['memory', 'redis', 'mongodb', 'memcached', 'riak'],
      message: 'Select cache engine to use',
      default: 'memory'
    },{
      type: 'input',
      name: 'cacheEngineOptions',
      message: 'Enter cache engine options in JSON format (if need)',
      default: '{}'
    },{
      type: 'input',
      name: 'host',
      message: 'Enter host which server will listen to (use $env.XXXX to read variable XXXX from environment)',
      default: 'localhost'
    },{
      type: 'input',
      name: 'port',
      message: 'Enter port which server will listen to (use $env.XXXX to read variable XXXX from environment)',
      default: '3000'
    },{
      type: 'confirm',
      name: 'changeBaseUrl',
      message: 'Would you like to change base url (required if you are going to use front server like nginx)?',
      default: false
    },{
      type: 'input',
      name: 'baseUrl',
      message: 'Enter base url',
      default: 'http://localhost',
      when: function(a){return a.changeBaseUrl;}
    },{
      type: 'confirm',
      name: 'changeViews',
      message: 'Would you like to fill settings of views?',
      default: true
    },{
      type: 'input',
      name: 'viewsPath',
      message: 'Enter views directory (relative project directory)',
      default: 'views',
      when: function(a){return a.changeViews;}
    },{
      type: 'input',
      name: 'viewsExt',
      message: 'Enter views default file extension',
      default: 'jade',
      when: function(a){return a.changeViews;}
    },{
      type: 'input',
      name: 'viewsModule',
      message: 'Enter module to compile views',
      default: 'jade',
      when: function(a){return a.changeViews;}
    },{
      type: 'confirm',
      name: 'createPlugin',
      message: 'Would you like to add own code to this project (as custom plugin)?',
      default: true
    }
    ];

    this.prompt(prompts, function (props) {
      var k;
      for(k in props){
        this.options[k] = props[k];
      }
      done();
    }.bind(this));
  },

  app: function () {
    this.options.cacheEngine = 'catbox-' + this.options.cacheEngine;
    this.options.modules = ['co', 'hapi', 'co-hapi', this.options.cacheEngine];
    this.options.modules.push(this.options.viewsModule || 'jade');
    this.options.devModules = ['mocha', 'co-mocha', 'should'];
    this.template('_package.json', 'package.json');
    if(this.options.createPlugin){
      this.copy('index.js');
    }
    this.options.cacheEngineOptions = JSON.parse(this.options.cacheEngineOptions || '{}');
    this.options.cacheEngineOptions.engine = this.options.cacheEngine;
    this.template('_composer.json', 'composer.json');
  },

  projectfiles: function () {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
    this.mkdir('test');
    this.copy('mocha.opts', 'test/mocha.opts');
  }
});

module.exports = CoHapiGenerator;
