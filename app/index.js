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
      type: 'input',
      name: 'serverOptions',
      message: 'Enter other server options in JSON format (if need)',
      default: '{}'
    },{
      type: 'input',
      name: 'plugins',
      message: 'Enter plugins to use in this app (comma separated list)',
      default: ''
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

  promtPluginsOptions: function(){
    this.options.plugins = (this.options.plugins || "").split(",").map(function(plugin){
      return (plugin || "").trim();
    }).filter(function(plugin){
      return plugin.length > 0;
    });
    this.options.pluginsOptions = this.options.pluginsOptions || {};
    if(this.options.plugins.length == 0){
      return;
    }
    var done = this.async();
    var promtPluginSettings = function(plugin, callback){
      this.prompt({
        type: 'input',
        name: 'options',
        message: 'Enter options of plugin \"' + plugin + '\" in JSON format (if need)',
        default: '{}'
      }, function (props) {
        this.options.pluginsOptions[plugin] = props.options;
        callback();
      }.bind(this));
    }.bind(this);
    async.mapSeries(this.options.plugins, promtPluginSettings, done);
  },

  app: function () {
    this.options.cacheEngine = 'catbox-' + this.options.cacheEngine;
    this.options.modules = ['co', 'hapi', 'co-hapi', this.options.cacheEngine]
    if(this.options.plugins.length > 0){
      this.options.modules = this.options.modules.concat(this.options.plugins);
    }
    this.options.devModules = ['mocha', 'co-mocha', 'should'];
    this.template('_package.json', 'package.json');
    if(this.options.createPlugin){
      this.options.pluginsOptions['.'] = "{}";
      this.copy('index.js');
    }
    this.options.cacheEngineOptions = JSON.parse(this.options.cacheEngineOptions || '{}');
    this.options.cacheEngineOptions.engine = this.options.cacheEngine;
    var k, list = [];
    for(k in this.options.pluginsOptions){
      list.push({name: k, options: this.options.pluginsOptions[k]})
    }
    this.options.pluginsOptions = list;
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
