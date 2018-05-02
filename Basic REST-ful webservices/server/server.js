const express = require('express');
const bodyParser = require('body-parser');

const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;
const POSTUPDATE = 303;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;

function serve(port, model) {
  const app = express();
  app.use(bodyParser.json());
  app.locals.model = model;
  app.locals.port = port;
  setupRoutes(app);
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
}

function setupRoutes(app) {
  app.get('/users/:id', getUserData(app));
  app.delete('/users/:id', deleteUserData(app));
  app.put('/users/:id', insertUserData(app));
  app.post('/users/:id', postUserData(app));
}

function requestUrl(req) {
  const port = req.app.locals.port;
  return `${req.protocol}://${req.hostname}:${port}${req.originalUrl}`;
}
  
module.exports = {
  serve: serve
}

function getUserData(app) {
  return function(request, response) {
    const parameter = request.params.id;
    if (typeof parameter === 'undefined') {
      response.sendStatus(BAD_REQUEST);
    }
    else {
      request.app.locals.model.users.find(parameter).
      then((results) => response.json(results)).
      catch((err) => {
        response.sendStatus(NOT_FOUND);
      });
    }  
  };
}


function deleteUserData(app) {
  return function(request, response) {
    const parameter = request.params.id;
    if (typeof parameter === 'undefined') {
      response.sendStatus(BAD_REQUEST);
    }else{
      request.app.locals.model.users.searchUser(parameter).
      then((results) => {
        if(results.length === 1){
          request.app.locals.model.users.deleteUser(parameter).
          then((results) => response.sendStatus(OK))
        }else{
          response.sendStatus(NOT_FOUND);
        }
      }).
      catch((err) => {
        response.sendStatus(NOT_FOUND);
      }); 
    }
  };
}


function insertUserData(app) {
  return function(request, response) {
    const parameter = request.params.id;
    const jsonbody = request.body;
    if (typeof parameter === 'undefined' || Object.keys(jsonbody).length === 0) {
      response.sendStatus(BAD_REQUEST);
    }else{
	  jsonbody['unique_user_id'] = parameter;
      request.app.locals.model.users.searchUser(parameter).
      then((results) => {
        if(results.length === 1){
          request.app.locals.model.users.updateData(results[0],jsonbody).
          then((resCode)=> {
            if(resCode === 204){
              response.sendStatus(NO_CONTENT);
            }
          }).
          catch((err) => {
            response.sendStatus(NO_CONTENT);
          });
        }else{
          request.app.locals.model.users.insertData(jsonbody).
          then((resCode) => {
            if(resCode === 201){
              response.append('Location', requestUrl(request));
              response.sendStatus(CREATED);
            }
          })
        }
      }).
    catch((err) => {
      response.sendStatus(NO_CONTENT);
    });
  }
  };
}


function postUserData(app) {
  return function(request, response) {
    const parameter = request.params.id;
    const jsonbody = request.body;
    if (typeof parameter === 'undefined' || Object.keys(jsonbody).length === 0) {
      response.sendStatus(BAD_REQUEST);
    }else{
	  jsonbody['unique_user_id'] = parameter;
      request.app.locals.model.users.searchUser(parameter).
      then((results) => {
        if(results.length === 1){
          request.app.locals.model.users.updateData(results[0],jsonbody).
          then((resCode)=> {
            response.append('Location', requestUrl(request));
            response.sendStatus(POSTUPDATE);
          })
        }else{
          response.sendStatus(NOT_FOUND);
        }
      }).
    catch((err) => {
      response.sendStatus(NOT_FOUND);
    });
  }
  };
}