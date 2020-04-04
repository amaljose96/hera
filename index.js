let heraInterceptor = require('./packageFiles/heraInterceptor');
let axiosInterceptor = require('./packageFiles/axiosInterceptor');

function Hera(app,axios,config){
  app.use(heraInterceptor);
  axios = axiosInterceptor(axios)
  Object.keys(config).forEach(key=>{
    process.env["HERA_"+key]=config[key]
  })
  return axios;
}
module.exports = Hera;
