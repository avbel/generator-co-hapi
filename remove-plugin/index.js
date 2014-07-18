'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');



var RemovepluginGenerator = yeoman.generators.NamedBase.extend({
  init: function () {
    this.on('error', function(err){
      this.log(chalk.bold.red(err));
      process.exit(1);
    }.bind(this));
  },

  changeFiles: function () {
    var packageFile = path.join(this.dest._base, "package.json");
    if(fs.existsSync(packageFile)){
      var name, version, pkg = JSON.parse(fs.readFileSync(packageFile, "utf8"));
      name = this.name;
      pkg.dependencies = pkg.dependencies || {};
      delete pkg.dependencies[name];
      fs.writeFileSync(packageFile, JSON.stringify(pkg, null, 2));
      var configFile = path.join(this.dest._base, "composer.json");
      if(fs.existsSync(configFile)){
        var cfg = JSON.parse(fs.readFileSync(configFile, "utf8"));
        cfg.plugins = cfg.plugins || {};
        delete cfg.plugins[name];
        fs.writeFileSync(configFile, JSON.stringify(cfg, null, 2));
      }
    }
    else{
      this.log(chalk.bold.red("Missing package.json"));
    }
  }
});

module.exports = RemovepluginGenerator;
