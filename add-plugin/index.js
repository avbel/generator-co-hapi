'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');

var AddpluginGenerator = yeoman.generators.NamedBase.extend({
  init: function () {
    this.on('error', function(err){
      this.log(chalk.bold.red(err));
      process.exit(1);
    }.bind(this));
    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
    });
  },

   askFor: function () {
    var done = this.async();
    var prompts = [{
      type: 'input',
      name: 'opts',
      message: 'Enter options of plugin \"' + this.name.split("@")[0] + '\"" in JSON format (if need)',
      default: '{}'
    },{
      type: 'input',
      name: 'url',
      message: 'Enter plugin\'s url if it is not located in npm registry',
      default: ''
    }];

    this.prompt(prompts, function (props) {
      var k;
      for(k in props){
        this.options[k] = props[k];
      }
      done();
    }.bind(this));
  },

  changeFiles: function () {
    var packageFile = path.join(this.dest._base, "package.json");
    if(fs.existsSync(packageFile)){
      var name, version, pkg = JSON.parse(fs.readFileSync(packageFile, "utf8"));
      var n = this.name.split("@");
      name = n[0];
      version = n[1] || "*";
      pkg.dependencies = pkg.dependencies || {};
      pkg.dependencies[name] = this.options.url || version
      fs.writeFileSync(packageFile, JSON.stringify(pkg, null, 2));
      var configFile = path.join(this.dest._base, "composer.json");
      if(fs.existsSync(configFile)){
        var cfg = JSON.parse(fs.readFileSync(configFile, "utf8"));
        cfg.plugins = cfg.plugins || {};
        cfg.plugins[name] = JSON.parse(this.options.opts || "{}");
        fs.writeFileSync(configFile, JSON.stringify(cfg, null, 2));
      }
    }
    else{
      this.log(chalk.bold.red("Missing package.json"));
    }
  }
});

module.exports = AddpluginGenerator;
