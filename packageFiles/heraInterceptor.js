let {
  registerNodeAction,
  completeNodeAction,
  errorNodeAction,
} = require("./register");
const heraInterceptor = (req, res, next) => {
  try {
    if (!req.originalUrl.includes(process.env.HERA_excludeUrlKeywords)) {
      registerNodeAction(req);
    }
  } catch (e) {
    console.error("Hera Error | Registering Node Initiated Action | ", e);
  }
  let oldResponseSender = res.send;
  res.send = function (data) {
    if (!data) {
      data = {};
    }
    if (res.statusCode === 200) {
      try {
        if (!req.originalUrl.includes(process.env.HERA_excludeUrlKeywords)) {
          completeNodeAction(req, res, data);
        }
      } catch (e) {
        console.error("Hera Error | Registering Node Complete Action | ", e);
      }
    } else {
      try {
        if (!req.originalUrl.includes(process.env.HERA_excludeUrlKeywords)) {
          errorNodeAction(req, res, data);
        }
      } catch (e) {
        console.error("Hera Error | Registering Node Error Action | ", e);
      }
    }
    res.send = oldResponseSender;
    oldResponseSender.apply(res, arguments);
  };
  next();
};

module.exports = heraInterceptor;
