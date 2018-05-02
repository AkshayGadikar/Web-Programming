const assert = require('assert');
const randomstring = require("randomstring");
const USERS = 'users';
const crypto = require('crypto');

function Users(db) {
  this.db = db;
  this.users = db.collection(USERS);
}

Users.prototype.getUser = function(id) {
  const searchSpec = { _id: id };
  return this.users.find(searchSpec).toArray()
}

Users.prototype.newUser = function(id, pass, userinfo) {
  let authtoken = crypto.randomBytes(20).toString('hex');
  const d = { _id: id, password: pass, DATA: userinfo, token: authtoken, timestamp: Date.now()};
  return this.users.insertOne(d).
    then(function(results) {
      return new Promise((resolve) => resolve(d));      
    });
}

Users.prototype.updateUser = function(userid){
  let authtoken = crypto.randomBytes(20).toString('hex');
  return this.users.update({"_id":userid},{$set: {"timestamp": Date.now(),"token": authtoken}}).
    then(function(results){
      return new Promise((resolve) => resolve(authtoken));
    });
}

module.exports = {
  Users: Users,
};
