"use strict";
module.exports.register = function*(plugin, options){
  //Do something here (register new routes, add new server methods, etc)
  plugin.route({
    path: "/",
    method: "GET",
    handler: function*(request){
      return "Hello Hapi";
    }
  });
};
module.exports.register.attributes = {
  name: "__index"
};
