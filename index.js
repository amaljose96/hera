let heraInterceptor = require('./packageFiles/heraInterceptor');
let axiosInterceptor = require('./packageFiles/axiosInterceptor');

function Hera(app,axios){
  app.use(heraInterceptor);
  axios = axiosInterceptor(axios)
  return axios;
}
module.exports = Hera;
