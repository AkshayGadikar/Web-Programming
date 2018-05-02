const axios = require('axios');
const options = require('./options').options;




const WS_URL = options.url;

function registerUserDetails(app,data){
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";		
    return axios.put(`${WS_URL}/users/${data.email}?pw=${data.psw}`, {
      firstName: data.First_Name,
      lastName: data.Last_Name,
    })
    .then((response) => {
      return response;
    }).catch((err) => console.log('User already exists'));
  }

function login(app,data){
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    return axios.put(`${WS_URL}/users/${data.email}/auth`, {
      pw: data.psw  
    })
    .then((response) => {
        return response;
      }).catch((err) => {
        if(err.response.status === 401 || err.response.status === 404){
          return 401;
        }else{
        console.error(err);}
      });
}  

function getUserdata(app,id){
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  return axios.get(`${WS_URL}/users/${id}`,
  {
    headers: {
      'Authorization': 'Bearer ' + app.locals.token
    }
  })
  .then((response) => {
    return response;
  }).catch((err) => console.error(err));
}

  module.exports = {
    registerUserDetails: registerUserDetails,
    login: login,
    getUserdata: getUserdata 
  };
