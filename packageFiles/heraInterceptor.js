
let {registerNodeAction,completeNodeAction,errorNodeAction} = require('./register');
const heraInterceptor = (req, res, next) => {
    registerNodeAction(req);
    let oldResponseSender=res.send;
    res.send=function(data){
      if(!data){
        data={}
      }
      if(res.statusCode===200){
        completeNodeAction(req,res,data);
      }
      else{
        errorNodeAction(req,res,data);
      }
      res.send=oldResponseSender;
      oldResponseSender.apply(res,arguments);
    }
    next();
  };
  
  module.exports = heraInterceptor;
  