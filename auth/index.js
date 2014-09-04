'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var async = require('async');
var crypto = require('crypto');
var ncp = require('ncp');
var fs = require('fs');
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
var charlen = chars.length;

function uid(length, callback){
  if(!callback) {
    callback = length;
    length = 32;
  }
  crypto.randomBytes(length, function(err, buf){
    if(err) return callback(err);
    var index, i, result = [];
    for(i = 0; i < length; i ++){
      index = (buf.readUInt8(i) % charlen);
      result.push(chars[index]);
    }
    callback(null, result.join(""));
  });
}


var AuthGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = require('../package.json');
    this.on('error', function(err){
      console.log(chalk.bold.red(err));
      process.exit(1);
    });
  },

  askFor: function () {
    var done = this.async();
    var prompts = [{
      type: 'confirm',
      name: 'useSSL',
      message: 'Are you going to use HTTPS?',
      default: false,
    },{
      type: 'input',
      name: 'minPasswordLength',
      message: 'Enter minimal password length',
      filter: function(v){return Number(v);},
      default: 6
    },{
      type: 'input',
      name: 'sessionCookie',
      message: 'Enter auth session cookie name',
      default: 'sid'
    },{
      type: 'confirm',
      name: 'ownViews',
      message: 'Would you like to create own views for auth ui?',
      default: false,
    },{
      type: 'confirm',
      name: 'ownEmailTemplates',
      message: 'Would you like to create own email templates for auth notifications?',
      default: false,
    },{
      type: 'checkbox',
      name: 'externalProviders',
      choices: ['facebook', 'github', 'google', 'instagram', 'live', 'twitter', 'yahoo', 'foursquare'],
      message: 'Choose external auth providers to use (if need)'
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

  addAuthPlugin: function () {
    var opts = {minPasswordLength: this.options.minPasswordLength};
    var composerFile = path.join(this.dest._base, "composer.json");
    var composer = JSON.parse(fs.readFileSync(composerFile, "utf8"));
    var authOpts = (composer.plugins['co-hapi-auth'] || {session: {}});
    var password = authOpts.session.password;
    var pepper = authOpts.pepper;
    var done = this.async();
    opts.session = {
      cookie: this.options.sessionCookie,
      isSecure: this.options.useSSL
    };

    var fillProviderOptions = function(provider, callback){
      var isSecure = this.options.useSSL;
      opts.providers = opts.providers || {};
      this.prompt([{
        type: 'input',
        name: 'clientId',
        message: 'Enter client id of \"' + provider + '\"'
      },{
        type: 'input',
        name: 'clientSecret',
        message: 'Enter client secret of \"' + provider + '\"'
      }], function (props) {
        opts.providers[provider] = props;
        uid(function(err, id){
          if(err) return callback(err);
          opts.providers[provider].password = id;
          opts.providers[provider].isSecure = isSecure;
          callback();
        });
      });
    }.bind(this);

    var i = 0;
    this.options.externalProviders = this.options.externalProviders || [];
    var fillProvidersOptions = function(callback){
      var f = function(){
        fillProviderOptions(this.options.externalProviders[i], function(err){
          if(err) return callback(err);
          i++;
          if(i == this.options.externalProviders.length) return callback();
          f();
        }.bind(this));
      }.bind(this);
      if(this.options.externalProviders.length > 0){
        f();
      }
      else{
        callback();
      }
    }.bind(this);

    var fillPassword = function(callback){
      if(password){
        opts.session.password = password;
        callback();
      }
      else{
        uid(function(err, id){
          if(err) return callback(err);
          opts.session.password = id;
          callback();
        });
      }
    };

    var fillPepper = function(callback){
      if(pepper){
        opts.pepper = pepper;
        callback();
      }
      else{
        uid(function(err, id){
          if(err) return callback(err);
          opts.pepper = id;
          callback();
        });
      }
    };

    var addMongoose = function(callback){
      if(composer.plugins['co-hapi-mongoose']){
        callback();
      }
      else{
        this.invoke("co-hapi:mongoose", {
          options: {
            'skip-install': true
          }
        }, callback);
      }
    }.bind(this);

    var addModels = function(callback){
      if(composer.plugins['co-hapi-models']){
        callback();
      }
      else{
        this.invoke("co-hapi:add-plugin", {
          options: {
            nested: true,
            'skip-install': true
          },
          args: ["co-hapi-models"]
        }, callback);
      }
    }.bind(this);

    var addPosto = function(callback){
      if(composer.plugins['posto']){
        callback();
      }
      else{
        this.invoke("co-hapi:posto", {
          options: {
            'skip-install': true
          }
        }, callback);
      }
    }.bind(this);

    var copyEmailTemplates = function(callback){
      var templatesDirectory = path.join(this.dest._base, ((composer.plugins["posto"] || {}).templatesOptions || {}).directory || "templates");
      if(!this.options.ownEmailTemplates){
        return callback();
      }
      var base = this.dest._base;
      fs.mkdir(templatesDirectory, function(){
        ncp(path.join(base, "node_modules", "co-hapi-auth", "templates"),
          templatesDirectory, {clobber: false}, callback);
      });
    }.bind(this);

    var copyViews = function(callback){
      var viewsDirectory = path.join(this.dest._base, ((composer.servers[0].options || {}).views || {}).path || "views");
      if(!this.options.ownViews){
        return callback();
      }
      var base = this.dest._base;
      fs.mkdir(viewsDirectory, function(){
        ncp(path.join(base, "node_modules", "co-hapi-auth", "views"),
          viewsDirectory, {clobber: false}, callback);
      });
    }.bind(this);

    var copyViewsAndEmailTemplates = function(callback){
      copyViews(function(err){
        if(err) return callback(err);
        copyEmailTemplates(callback);
      });
    };

    opts.useInternalViews = !this.options.ownViews;
    opts.useInternalEmailTemplates = !this.options.ownEmailTemplates;
    var self = this;
    var dependencies = ['then-jade'];
    if(this.options.ownViews){
      dependencies.push('jade');
    }
    fillProvidersOptions(function(err){
      if(err) return done(err);
      fillPassword(function(err){
        if(err) return done(err);
        fillPepper(function(err){
          if(err) return done(err);
          addMongoose(function(err){
            if(err) return done(err);
            addModels(function(err){
              if(err) return done(err);
              addPosto(function(err){
                self.invoke("co-hapi:add-plugin", {
                  options: {
                    nested: true,
                    'skip-install': true,
                    force: true,
                    opts: JSON.stringify(opts),
                    dependencies: dependencies
                  },
                  args: ['co-hapi-auth']
                }, function(err){
                  if(err) return done(err);
                  if(!self.options['skip-install']) {
                    self.installDependencies(function(){
                      copyViewsAndEmailTemplates(done);
                    });
                  }
                  else{
                    done();
                  }
                });
              });
            });
          });
        });
      });
    });
  }
});

module.exports = AuthGenerator;
