#!/usr/bin/env nodejs

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const options = require('./options').options;
const helper = require('./helper');
const mustache = require('mustache');
const fs = require('fs');
const session = require('express-session');
const https = require('https');

const app = express();
const TEMPLATES_DIR = 'views';

function setupRoutes(app) {
  app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge : 60000}
  }));
  app.use(bodyParser.urlencoded({extended: true}));
  app.get('/', LoginRedirectHandler(app));
  app.get('/Register', RegisterRedirectHandler(app));
  app.get('/Login.html', LoginRedirectHandler(app));
  app.post('/validate', Registration(app));
  app.post('/LoginSubmit', LoginCheck(app));
  app.get('/Logout', Logout(app));
  app.get('/accountinfo', AccountInfo(app));
}

function AccountInfo(app){
  return function(req, res){
    if(req.session.user){
      helper.getUserdata(app,req.session.user,req.session.token)
      .then((response) => {
        if(response.status === 200){
          console.log('Display Account Page');
		  let resdata = Object.values(response.data);
		  app.locals.info1 = resdata[0];
		  app.locals.info2 = resdata[1];
          const data = { FirstName: resdata[0], LastName: resdata[1]};
          res.send(doMustache(app, 'account', data));
        }else{
          console.log('Error in getting data');
        }
      }).catch((err) => console.error(err));
    }else{
      console.log('Display Login page');
      res.send(doMustache(app, 'login', {}));
    }
  };
}

function LoginRedirectHandler(app) {
  return function(req, res) {
	 if(req.session.user){
		 console.log('Display Account Page');
         const data = { FirstName: app.locals.info1, LastName: app.locals.info2};
         res.send(doMustache(app, 'account', data));
	 }else{
    console.log('Display Login page');
    res.send(doMustache(app, 'login', {}));
	}
  };
}

function RegisterRedirectHandler(app) {
  return function(req, res) {
    console.log('Display Register Page');
    res.send(doMustache(app, 'Register', {}));
  };
}

function Logout(app){
  return function(req,res) {
    //session logout logic
    req.session.destroy();
    console.log('Display Login page');
    res.send(doMustache(app, 'login', {}));
  };
}

function LoginCheck(app) {
  let emailRegex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  return function(req, res) {
    if (typeof req.body.email === 'undefined' || req.body.email.trim().length === 0 ||
    typeof req.body.psw === 'undefined' || req.body.psw.trim().length === 0){
      const errors = { emptyError: 'Please provide a value', email_id: req.body.email};
      res.send(doMustache(app, 'login', errors));
    }else if(emailRegex.test(req.body.email) == false){
      const errors = { emailError: 'Please provide a valid email', email_id: req.body.email};
      res.send(doMustache(app, 'login', errors));
    }else{
      helper.login(app,req.body)
      .then((response) => {
        if(response === 401){
          const errors = { emailError: 'Invalid email or password', email_id: req.body.email};
          res.send(doMustache(app, 'login', errors));
        }else if(response.data.status === 'OK'){
          console.log('Display Account Page');
          req.session.user = req.body.email;
          app.locals.token = response.data.authToken;
          res.redirect('/accountinfo');
        }   
      }).catch((err) => console.error(err));
    }
  };
}


function Registration(app){
  let emailRegex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  let passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return function(req, res){
    if (typeof req.body.First_Name === 'undefined' || req.body.First_Name.trim().length === 0 ||
    typeof req.body.Last_Name === 'undefined' || req.body.Last_Name.trim().length === 0 ||
    typeof req.body.email === 'undefined' || req.body.email.trim().length === 0 ||
    typeof req.body.psw === 'undefined' || req.body.psw.trim().length === 0 ||
    typeof req.body.rpsw === 'undefined' || req.body.rpsw.trim().length === 0) {
      const errors = { emptyError: 'Please provide a value' , email_id:req.body.email, firstname: req.body.First_Name, lastname: req.body.Last_Name};
      res.send(doMustache(app, 'Register', errors));
    }else if(emailRegex.test(req.body.email) == false){
      const errors = { emailError: 'Please provide a valid email', email_id:req.body.email, firstname: req.body.First_Name, lastname: req.body.Last_Name};
      res.send(doMustache(app, 'Register', errors));
    }else if(req.body.psw !== req.body.rpsw){
      const errors = { passwordError: 'Passwords do not match', email_id:req.body.email, firstname: req.body.First_Name, lastname: req.body.Last_Name};
      res.send(doMustache(app, 'Register', errors));
    }else if(passRegex.test(req.body.psw) === false){
		const errors = { emailError: 'Invalid password, make it strong', email_id:req.body.email, firstname: req.body.First_Name, lastname: req.body.Last_Name};
      res.send(doMustache(app, 'Register', errors));
	}else{
      //call function
      helper.registerUserDetails(app,req.body)
      .then((response) => {
        if(response === undefined){
          const errors = { emailError: 'User Exists', email_id:req.body.email, firstname: req.body.First_Name, lastname: req.body.Last_Name};
		  res.send(doMustache(app, 'Register', errors));
        }else{
		  if(response.status === 201){
			console.log('user registered');
			app.locals.token = response.data.authToken;
			req.session.user = req.body.email;
			res.redirect('/accountinfo');
			}		
		}
      }).catch((err) => console.error(err));
    }  
  };
}

function setupTemplates(app) {
  app.templates = {};
  for (let fname of fs.readdirSync(TEMPLATES_DIR)) {
    const m = fname.match(/^([\w\-]+)\.ms$/);
    if (!m) continue;
    try {
      app.templates[m[1]] =
	String(fs.readFileSync(`${TEMPLATES_DIR}/${fname}`));
    }
    catch (e) {
      console.error(`cannot read ${fname}: ${e}`);
      process.exit(1);
    }
  }
}


  function doMustache(app, templateId, view) {
    const templates = { };
    return mustache.render(app.templates[templateId], view, templates);
  }

  function serve(options,app) {
    const port = options.port;
    app.locals.port = port;
    setupRoutes(app);
    setupTemplates(app);
    https.createServer({
      key: fs.readFileSync(`${options.sslDir}/key.pem`),
      cert: fs.readFileSync(`${options.sslDir}/cert.pem`),
    }, app).listen(port, function() {
      console.log(`listening on port ${port}`);
    });
  }
  
  serve(options,app);