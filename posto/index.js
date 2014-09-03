'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var async = require('async');


var PostoGenerator = yeoman.generators.Base.extend({
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
      type: 'list',
      name: 'transport',
      choices: ['mailgun api', 'smtp', 'another'],
      message: 'Select email transport',
      default: 'smtp'
    },{
      type: 'input',
      name: 'mailgunApiKey',
      message: 'Enter Mailgun api key',
      when: function(a){ return a.transport == 'mailgun api';}
    },{
      type: 'input',
      name: 'mailgunDomain',
      message: 'Enter Mailgun domain (if need)',
      filter: function(r){return (r && r != 'none')?r:undefined},
      when: function(a){ return a.transport == 'mailgun api';}
    },{
      type: 'list',
      name: 'smtpService',
      choices: ['1und1', 'AOL', 'DynectEmail', 'FastMail', 'Gmail', 'Godaddy', 'GodaddyAsia', 'GodaddyEurope', 'hot.ee', 'Hotmail', 'iCloud', 'mail.ee', 'Mail.ru', 'Mailgun', 'Mailjet', 'Mandrill', 'Postmark', 'QQ', 'QQex', 'SendCloud', 'SendGrid', 'SES', 'Yahoo', 'Yandex', 'Zoho', 'custom'],
      message: 'Select SMTP service (use \"custom\" if you would like enter own host and port)',
      default: 'custom',
      when: function(a){ return a.transport == 'smtp';}
    },{
      type: 'input',
      name: 'smtpHost',
      message: 'Enter SMTP host',
      filter: function(r){return (r)?r:undefined},
      when: function(a){ return a.smtpService == 'custom' &&  a.transport == 'smtp';}
    },{
      type: 'input',
      name: 'smtpPort',
      message: 'Enter SMTP port',
      filter: function(r){return (r)?r:undefined},
      when: function(a){ return a.smtpService == 'custom' &&  a.transport == 'smtp';}
    },{
      type: 'confirm',
      name: 'smtpSecure',
      message: 'Would you like to use SSL/TLS with SMTP server?',
      default: true,
      filter: function(r){return (r)?r:undefined},
      when: function(a){ return a.smtpService == 'custom' &&  a.transport == 'smtp';}
    },{
      type: 'input',
      name: 'smtpUser',
      message: 'Enter user name of SMTP server',
      filter: function(r){return (r)?r:undefined},
      when: function(a){ return a.transport == 'smtp';}
    },{
      type: 'password',
      name: 'smtpPass',
      message: 'Enter password of SMTP server',
      filter: function(r){return (r)?r:undefined},
      when: function(a){ return a.transport == 'smtp';}
    },{
      type: 'input',
      name: 'anotherTransportModule',
      message: 'Enter module name of email transport',
      filter: function(r){return (r)?r:undefined},
      when: function(a){ return a.transport == 'another';}
    },{
      type: 'input',
      name: 'anotherTransportOptions',
      message: 'Enter options of email transport as JSON',
      filter: function(r){return (r)?r:undefined},
      when: function(a){ return a.transport == 'another';},
      default: "{}"
    },{
      type: 'input',
      name: 'from',
      message: 'Enter default \"from\" address'
    },{
      type: 'input',
      name: 'templatesDirectory',
      message: 'Enter directory with email templates (relative working directory)',
      default: 'templates'
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

  addPostoPlugin: function () {
    var opts = { transportOptions: {}};
    var transportOpts = opts.transportOptions;
    if(this.options.transport == "mailgun api"){
      opts.transport = "nodemailer-mailgunapi-transport";
      transportOpts.apiKey = this.options.mailgunApiKey;
      if(this.options.mailgunDomain){
        transportOpts.domain = this.options.mailgunDomain;
      }
    }
    else if(this.options.transport == "smtp"){
      opts.transport = "nodemailer-smtp-transport";
      if(this.options.smtpService == "custom"){
        transportOpts.host = this.options.smtpHost;
        transportOpts.port = this.options.smtpPort;
        transportOpts.secure = this.options.smtpSecure;
      }
      else{
        transportOpts.service = this.options.smtpService;
      }
      transportOpts.auth = {user: this.options.smtpUser, pass: this.options.smtpPass};
    }
    else{
      opts.transport = this.options.anotherTransportModule;
      opts.transportOptions = JSON.parse(this.options.anotherTransportOptions || "{}");
    }
    opts.from = this.options.from;
    opts.templatesOptions = { directory: this.options.templatesDirectory };
    this.mkdir(opts.templatesOptions.directory);
    this.invoke("co-hapi:add-plugin", {
      options: {
        nested: true,
        'skip-install': this.options['skip-install'],
        force: true,
        opts: JSON.stringify(opts),
        dependencies: [opts.transport]
      },
      args: ["posto"]
    });
  }
});

module.exports = PostoGenerator;
