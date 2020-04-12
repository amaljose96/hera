let heraInterceptor = require('./packageFiles/heraInterceptor');
let axiosInterceptor = require('./packageFiles/axiosInterceptor');
const express = require("express");
var path = require('path'); 

function Hera(app,axios,config){
  attachHeraToExpress(app,config);
  return attachHeraToAxios(axios,config.axiosConfig);
}

function attachHeraToExpress(app,config){
  app.use(heraInterceptor);
  console.log(path.join(__dirname, 'dashboard'))
  app.use("/hera",express.static(path.join(__dirname, 'dashboard')));
  Object.keys(config).forEach(key=>{
    process.env["HERA_"+key]=config[key]
  })
  if(process.env["HERA_excludeUrlKeywords"]){
    process.env["HERA_excludeUrlKeywords"].push("hera");
  }else{
    process.env["HERA_excludeUrlKeywords"]=["hera"]
  }
  
  app.get("/hera-data-source",require('./packageFiles/search'));
}
function attachHeraToAxios(axios,extraAxiosConfig){
  axios = axiosInterceptor(axios,extraAxiosConfig)
  return axios;
}
module.exports = {Hera,attachHeraToExpress,attachHeraToAxios};
