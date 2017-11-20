'use strict'
const axios = require('axios')
const https = require('https')

const customAxios = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

/**
*   call obj[method] on each element in array
*  @param {Object} obj
*  @param {String} method
*  @param {Array} arr
*/

const callObjMethodOnArray = (obj, method, arr) => arr.forEach(el => obj[method](el))

const initMiddleWares = (app, method, arr) =>
  method === 'use' || method === 'get' || method === 'set'
  ? callObjMethodOnArray(app, method, arr)
  : console.og('Wrong method name : ', method)

const makeAuthRoute = (url, params) => {
  return `${url}/api/v1/authorize?response_type=code`
  + `&client_id=${params.clientID}&redirect_uri=${params.callbackURL}`
  + `&scope=${encodeURIComponent(params.scope)}&state=${params.state}&nonce=${params.nonce}`
}

const requestToken = (url, params, code) => {
  return customAxios.post(`${url}/api/v1/token`, {
    redirect_uri: params.callbackURL,
    client_id: params.clientID,
    client_secret: params.clientSecret,
    grant_type: 'authorization_code',
    code: code
  })
}

const getUserInfo = (url, access_token) => {
  return customAxios.get(`${url}/api/v1/userinfo?schema=openid`,
    { headers: { Authorization: `Bearer ${access_token}`}})
}

//  error handler
// will print stacktrace for dev not for pro
const errorHandlerDev = app => {
  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  })
}

module.exports = {
  initMiddleWares,
  errorHandlerDev,
  makeAuthRoute,
  requestToken,
  getUserInfo
}
