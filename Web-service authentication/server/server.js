const express = require('express');
const bodyParser = require('body-parser');
const hash = require('bcrypt');
const https = require('https');
const KEY_PATH = './key.pem';
const CERT_PATH = './cert.pem';
const fs = require('fs');

const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;
const FOUND = 302;
const SEE_OTHER = 303;
const BAD_REQUEST = 400;
const ERROR_UNAUTHORIZED = 401;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;

function serve(opts, model) {
  const app = express();
  app.use(bodyParser.json());
  app.locals.model = model;
  app.locals.port = opts.options.port;
  app.locals.authtime = opts.options.authTimeout;
  setupRoutes(app);
  https.createServer({
    key: fs.readFileSync(KEY_PATH),
    cert: fs.readFileSync(CERT_PATH),
    }, app).listen(app.locals.port);
}


function setupRoutes(app) {
  app.put('/users/:id', insertUser(app));
  app.put('/users/:id/auth', authUser(app));
  app.get('/users/:id', getUser(app));
}

module.exports = {
  serve: serve
}

function requestUrl(req) {
  const port = req.app.locals.port;
  return `${req.protocol}://${req.hostname}:${port}${req.originalUrl.split('?')[0]}`;
}


function getUser(app){
  return function(request, response){
    const userid = request.params.id;
    request.app.locals.model.users.getUser(userid).
    then(function(results){
          if(results.length === 1){
            if(typeof request.headers.authorization === 'undefined'){
		  response.status(ERROR_UNAUTHORIZED).send({ "status": "ERROR_UNAUTHORIZED",
		"info": `/users/${userid} requires a bearer authorization header`
		  });
	    }
	    
            if((request.headers.authorization).split(' ')[1] === undefined || (request.headers.authorization).split(' ')[0]!== 'Bearer'){
              response.status(ERROR_UNAUTHORIZED).send({ "status": "ERROR_UNAUTHORIZED",
              "info": `/users/${userid} requires a bearer authorization header`
              });
            }
	    const token = (request.headers.authorization).split(' ')[1];
            if(token === results[0]['token'] && Date.now() - results[0]['timestamp'] <= app.locals.authtime*1000){
              response.status(OK).send(results[0]['DATA']);
            }else{
              response.status(ERROR_UNAUTHORIZED).send({ "status": "ERROR_UNAUTHORIZED",
              "info": `/users/${userid} requires a bearer authorization header`
              });
            }
          }
          else{
            response.status(NOT_FOUND).send({ "status": "ERROR_NOT_FOUND",
            "info": `user ${userid} not found`
            });
          }
    }).
    catch((err) =>{
      console.log(err);
    })
  }
}


function authUser(app) {
  return function(request, response) {
    const userInfo = request.body;
    const userid = request.params.id;
    if (typeof userid === 'undefined' || Object.keys(userInfo).length === 0) {
      response.sendStatus(BAD_REQUEST);
    }
    else if(!(userInfo.hasOwnProperty('pw'))){
      response.status(ERROR_UNAUTHORIZED).send({ "status": "ERROR_UNAUTHORIZED",
      "info": `/users/${userid}/auth requires a valid 'pw' password query parameter`          
      });
    }
    else {
      request.app.locals.model.users.getUser(userid).
      then(function(results){
        if(results.length === 0){
          response.status(NOT_FOUND).send({ "status": "ERROR_NOT_FOUND",
          "info": `user ${userid} not found`          
          });
        }else{
        if(hash.compareSync(userInfo['pw'], results[0]['password'])) {
          // Passwords match
          request.app.locals.model.users.updateUser(userid).
          then(function(token) {
            response.status(OK).send({ "status": "OK",
            "authToken": `${token}`
            });
          }).
          catch((err) => {
            console.log(err);
          });
         } else {
          // Passwords don't match
          response.status(ERROR_UNAUTHORIZED).send({ "status": "ERROR_UNAUTHORIZED",
          "info": `/users/${userid}/auth requires a valid 'pw' password query parameter`          
          });
         }
        }
      }).
      catch((err) =>{
          console.log(err);
      });   
    }
  }
}


function insertUser(app) {
  return function(request, response) {
    const userInfo = request.body;
    const id = request.params.id;
    const pass = request.query.pw;
    if (typeof id === 'undefined' || Object.keys(userInfo).length === 0 || typeof pass  === undefined || pass  === ''){
      response.sendStatus(BAD_REQUEST);
    }
    else {
      const password = hash.hashSync(request.query.pw, 10);
      request.app.locals.model.users.getUser(id).
      then(function(results){
        if(results.length === 0){
          request.app.locals.model.users.newUser(id, password, userInfo).
          then(function(results) {
            response.append('Location', requestUrl(request));
            response.status(CREATED).send({ "status": "CREATED",
            "authToken": `${results['token']}`
            });
          }).
          catch((err) => {
            console.log(err);
          });
        }else{
        response.append('Location', requestUrl(request));
        response.status(SEE_OTHER).send({ "status": "EXISTS",
        "info": `user ${id} already exists`
        });
      }
      }).
      catch((err) =>{
          console.log(err);
      });   
    }
  }
}


