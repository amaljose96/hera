# Hera

This analytical tool mainly helps in tracking API performance.

## Features
1. Actions : Check the performance of various aggregator endpoints by analysing the performance overheads from individual APIs.

2. API Performance : Checking API response times and error rates.

## How to use?

### Installation

First of all, install the package by 

```
npm install hera-monitor
```

### Usage 

If your app is small, I'd recommend using the following way:

```javascript
let { Hera } = require("hera-monitor");
const express = require("express");
const app = express();
let axios = require("axios");
axios = Hera(app, axios);
```

This would would provide an express app and axios which is linked with Hera.

In case you're using axios and the express app in different files, the following method can be used:

App.js
```javascript
let { attachHeraToExpress } = require("hera-monitor");
const express = require("express");
const app = express();
attachHeraToExpress(app)
```

service.js
```javascript
let { attachHeraToAxios } = require("hera-monitor");
let axios = require("axios");
axios = attachHeraToAxios(axios)
```

Also, for Hera to record individual API calls, the request from express needs to be provided as sourceRequest in axios config.

eg.
```javascript
axios(
  {
    url: "url",
    method: "rest method",
    ...other_params
  },
  {
    sourceRequest: expressRequest
  }
).then(response => {
  //Handle the response
});

axios
  .get("url", {
    sourceRequest: expressRequest
  })
  .then(response => {
    //Handle the response
  });
```

### Options

1. In case you want to create an axios instance with a configuration, it can be passed while attaching Hera to axios.
eg.
```javascript
let { Hera } = require("hera-monitor");
const express = require("express");
const app = express();
let axios = require("axios");
axios = Hera(app, axios, {
  axiosConfig: {
    //Required axios configuration
  }
});

let { attachHeraToAxios } = require("hera-monitor");
let axios = require("axios");
axios = attachHeraToAxios(axios, {
  //Required axios configuration
});
```

2. Here is a list of other options which can be provided while starting Hera, as the third parameter to Hera or the second parameter to attachHeraToExpress

eg.
```javascript
let { Hera } = require("hera-monitor");
const express = require("express");
const app = express();
let axios = require("axios");
axios = Hera(app, axios, {
  historyLimit: 4
});

let { attachHeraToExpress } = require("hera-monitor");
const express = require("express");
const app = express();
attachHeraToExpress(app, {
  historyLimit: 4
});
```
 * historyLimit : This specifies how many days of logs should be retained. By default, this is 7.
 * callLife : This specifies how long Hera would wait for a call to be resolved (in ms) before its discarded. By default, this is 10800000. 