'use strict';

const assert = require('assert');
const mongo = require('mongodb').MongoClient;


//used to build a mapper function for the update op.  Returns a
//function F = arg => body.  Subsequently, the invocation,
//F.call(null, value) can be used to map value to its updated value.
function newMapper(arg, body) {
  return new (Function.prototype.bind.call(Function, Function, arg, body));
}

//print msg on stderr and exit.
function error(msg) {
  console.error(msg);
  process.exit(1);
}

//export error() so that it can be used externally.
module.exports.error = error;


//auxiliary functions; break up your code into small functions with
//well-defined responsibilities.
function insertIntoTable(json,db,closedb){
  for (var i = 0; i < json.args.length; i++) {
    var jsonObj = json.args[i];
    db.collection(json.collection).insertOne(jsonObj,function(err) {
      if (err) throw err;
    })
  }
  closedb();
}

function readDB(json,db,closedb){
  if(json.hasOwnProperty('args')){
    db.collection(json.collection).find(json.args).toArray(function(err, result){
      if(err) throw err;
      if(result.length > 0){
      console.log(result);
      }
    })
  }else{
    db.collection(json.collection).find({}).toArray(function(err, result){
      if(err) throw err;
      console.log(result);
    })
  }
  closedb();
}

function deleteRecord(json,db,closedb){
  var jsonObj = json.args;
  db.collection(json.collection).deleteMany(jsonObj,function(err) {
    if (err) throw err;
  });
  closedb();  
}

function updateRecord(json,db,closedb){
    var mapper = newMapper(json.fn[0], json.fn[1]);
    db.collection(json.collection).find(json.args,{"_id": 0}).toArray().then(function(result) {
      for (var i = 0; i < result.length; i++) {
        db.collection(json.collection).update(result[i],mapper.call(null,result[i]),function(err) {
          if (err) throw err;
        });
      }
    }).then(function(result){
      closedb();
    })
}

//perform op on mongo db specified by url.
function dbOp(url, op) {
  mongo.connect(url, function(err, db){
    if(err){
      throw err;
    }
    var json = JSON.parse(op);
    if(json.op === "create"){
      insertIntoTable(json,db,function(err){
        if(err) throw err;
        db.close();
      })
    }

    if(json.op === "read"){
      readDB(json,db,function(err){
        if(err) throw err;
        db.close();
      })
    }

    if(json.op === "delete"){
      deleteRecord(json,db,function(err){
        if(err) throw err;
        db.close();
      })
    }

    if(json.op === "update"){
      updateRecord(json,db,function(err){
        if(err) throw err;
        db.close();
      })
    }
  })
}

//make main dbOp() function available externally
module.exports.dbOp = dbOp;
