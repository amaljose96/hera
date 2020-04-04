const fs = require("fs");
function searchParametersValidator(searchParameters) {
  let historyLimit = process.env.HERA_historyLimit || 7;
  let possibleSearchStart = new Date();
  possibleSearchStart.setDate(new Date().getDate() - historyLimit);
  let possibleSearchEnd = new Date();
  possibleSearchEnd.setHours(possibleSearchEnd.getHours() + 1);

  if (!searchParameters.start) {
    searchParameters.start = possibleSearchStart.getTime();
  } else {
    searchParameters.start = parseInt(searchParameters.start);
  }
  if (!searchParameters.end) {
    searchParameters.end = possibleSearchEnd.getTime();
  } else {
    searchParameters.end = parseInt(searchParameters.end);
  }
  if (isNaN(new Date(searchParameters.start))) {
    return "Start Time wrong";
  } else if (isNaN(new Date(searchParameters.end))) {
    return "End Time wrong";
  } else if (new Date(searchParameters.start) < possibleSearchStart) {
    return (
      "Start Time before possible range : " +
      searchParameters.start +
      "(" +
      new Date(searchParameters.start) +
      ") is before " +
      possibleSearchStart
    );
  } else if (new Date(searchParameters.end) < possibleSearchStart) {
    return (
      "End Time before possible range : " +
      searchParameters.end +
      "(" +
      new Date(searchParameters.end) +
      ") is before " +
      possibleSearchStart
    );
  } else if (new Date(searchParameters.start) > possibleSearchEnd) {
    return (
      "Start Time in the future : " +
      searchParameters.start +
      "(" +
      new Date(searchParameters.start) +
      ") is after " +
      new Date()
    );
  } else if (new Date(searchParameters.end) > possibleSearchEnd) {
    return (
      "End Time in the future : " +
      searchParameters.end +
      "(" +
      new Date(searchParameters.end) +
      ") is after " +
      new Date()
    );
  }
  return "PASS";
}
function searchController(request, response) {
  let searchParameters = request.query;
  let searchParametersValidation = searchParametersValidator(searchParameters);
  if (searchParametersValidation !== "PASS") {
    response.status(400).send(searchParametersValidation);
  }
  getSearchResults(searchParameters).then(searchResults => {
    response.send({
      results: searchResults,
      parameters: searchParameters
    });
  });
}
function satisfiesSearchParameters(searchParameters,action){
    if(searchParameters.urlKeyword){
        return Object.keys(action.logs).some(type=>{
           return action.logs[type].url.includes(searchParameters.urlKeyword)
        })
    }
    return true;
}
function formatAction(action){
    let simplifiedLogs={};
    Object.keys(action.logs).forEach(type=>{
        let simplifiedLog={
            accurateTime:action.logs[type].accurateTime,
            method:action.logs[type].method,
            responseCode:action.logs[type].responseCode,
            time:action.logs[type].time,
            traceId:action.logs[type].traceId,
            type:action.logs[type].type,
            url:action.logs[type].url,
        }
        simplifiedLogs[type]=simplifiedLog;
    })
    action.logs=simplifiedLogs;
    return action;
}
function promisedReadFile(fileName){
    return new Promise((resolve,reject)=>{
        fs.readFile(fileName,(err,response)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(response);
            }
        })
    })
}
async function getSearchResults(searchParameters) {
  return new Promise((resolve, reject) => {
    let possibleSearchFiles = [];
    let searchFiles = [];
    let searchResults={};
    let dateHourCursor = new Date(searchParameters.start);
    let logPath =
      process.env.HERA_dev === "true" ? "logs" : "./node_modules/hera/logs";
    while (
      dateHourCursor.getTime() < new Date(searchParameters.end).getTime()
    ) {
      possibleSearchFiles.push(
        dateHourCursor.getDate() + "_" + dateHourCursor.getHours() + ".json"
      );
      dateHourCursor.setHours(dateHourCursor.getHours() + 1);
    }
    fs.readdir(logPath, (err, files) => {
      searchFiles = files.filter(fileName => {
        return possibleSearchFiles.includes(fileName);
      });
      let searchPromises=searchFiles.map(fileName=>{
          return promisedReadFile(logPath + "/" + fileName).then(response=>{
            let log = JSON.parse(response);
            Object.keys(log).forEach(searchIndex=>{
                let logBlock=log[searchIndex];
                Object.keys(logBlock).forEach(traceId=>{
                    if(satisfiesSearchParameters(searchParameters,logBlock[traceId])){
                        searchResults[traceId]=formatAction(logBlock[traceId]);
                    }
                });
            })
          });
      });
      Promise.all(searchPromises).then(()=>{
          resolve(searchResults);
      })
    });
  });
}

module.exports = searchController;
