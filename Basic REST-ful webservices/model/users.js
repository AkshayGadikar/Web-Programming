const assert = require('assert');
const USERS = 'userdata';

function Users(db) {
  this.db = db;
  this.userdata = db.collection(USERS);
}

Users.prototype.find = function(query) {
  return this.searchUser(query).
  then(function(results){
    return new Promise(function(resolve, reject){
      if(results.length === 1){
        resolve(results[0]);
      }else{
        reject();
      }
    });
  });
}

Users.prototype.searchUser = function(query){
  const searchSpec = { 'unique_user_id': query };
  return this.userdata.find(searchSpec).toArray();
}


Users.prototype.deleteUser = function(query) {
  const searchSpec = { 'unique_user_id': query };
  return this.userdata.remove(searchSpec).
  then(function(results){
    return new Promise(function(resolve, reject){
      if (results.result.n === 1) {
        resolve();
      }
      else {
        reject();
      }
    });
  });
}


Users.prototype.insertData = function(jsonbody){
  return this.userdata.insert(jsonbody).
  then(function(results){
    return new Promise(function(resolve, reject){
      if(results.insertedCount !== 1){
        reject();
      }else{
        resolve(201);
      }
    });
  });
}


Users.prototype.updateData = function(oldbody,jsonbody){
  return this.userdata.update(oldbody,{$set:jsonbody}).
  then(function(results){
    return new Promise(function(resolve, reject){
      if(results.result.nModified !== 1){
        reject();
      }else{
        resolve(204);
      }
    });
  });
}
 
module.exports = {
  Users: Users
};
