let heraInterceptor = require('./packageFiles/heraInterceptor');
let axiosInterceptor = require('./packageFiles/axiosInterceptor');

function Hera(app,axios,config){
  attachHeraToExpress(app);
  Object.keys(config).forEach(key=>{
    process.env["HERA_"+key]=config[key]
  })
  return attachHeraToAxios(axios,config.axiosConfig);
}

function attachHeraToExpress(app){
  app.use(heraInterceptor);
  app.use("/hera",(req,res)=>{
    res.send("Hera's dedicated");
  });
  app.get("/hera-data-source",require('./packageFiles/search'));
}
function attachHeraToAxios(axios,extraAxiosConfig){
  axios = axiosInterceptor(axios,extraAxiosConfig)
  return axios;
}
module.exports = {Hera,attachHeraToExpress,attachHeraToAxios};
