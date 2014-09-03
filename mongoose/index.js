'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var async = require('async');


var MongooseGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = require('../package.json');
    this.on('error', function(err){
      console.log(chalk.bold.red(err));
      process.exit(1);
    });
  },

  askFor: function () {
    var done = this.async();
    var defaultName = path.basename(this.dest._base);
    var prompts = [{
      type: 'input',
      name: 'connectionString',
      message: 'Enter connection string to mongodb database',
      default: 'mongodb://localhost/' + defaultName + '_dev'
    }];
    this.prompt(prompts, function (props) {
      var k;
      for(k in props){
        this.options[k] = props[k];
      }
      done();
    }.bind(this));
  },

  addMongoosePlugin: function () {
    var opts = {};
    if(this.options.connectionString){
      opts.connectionString = this.options.connectionString;
    }
    this.invoke("co-hapi:add-plugin", {
      options: {
        nested: true,
        'skip-install': this.options['skip-install'],
        force: true,
        opts: JSON.stringify(opts)
      },
      args: ["co-hapi-mongoose"]
    });
  }
});

module.exports = MongooseGenerator;
