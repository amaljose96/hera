const express = require("express");
const app = express();
const { Hera } = require("../");
const port = 3000;
let axios = require("axios");
axios = Hera(app, axios, { dev: true ,historyLimit:0});

app.get("/", (req, res) => res.send("Hello World!"));
app.get("/site", (req, res) => {
  axios
    .get("https://googlea.com", { sourceRequest: req })
    .then(response => {
      res.send(response.data);
    })
    .catch(err => {
      res.status(err.code || 500).send(err.message);
    });
});
app.use(function(req, res, next) {
  res.status(404).send("Not Found");
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
