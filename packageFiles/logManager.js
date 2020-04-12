let writeBatchToFile = require("./batchWriter");
let logBuffer = [];

function getTime() {
  let date = new Date();
  return (
    date.getFullYear() +
    "-" +
    date.getMonth() +
    "-" +
    date.getDate() +
    " " +
    date.getHours() +
    ":" +
    date.getMinutes() +
    ":" +
    date.getSeconds() +
    ":" +
    date.getMilliseconds()
  );
}

function addEntry(
  traceId,
  type,
  method,
  url,
  headers,
  request,
  responseCode,
  response
) {
  console.log(
    getTime(),
    " : ",
    traceId,
    " : ",
    type,
    " | ",
    method,
    " ",
    url,
    " | ",
    responseCode
  );
  if(type.includes("API")){
    type=type+"_"+method+"_"+url;
  }
  logBuffer.push({
    time: getTime(),
    accurateTime: Date.now(),
    traceId,
    type,
    method,
    url,
    headers,
    request,
    responseCode,
    response
  });
}

function getIndexString(time) {
  let segments = time.split(" ")
  let minute = segments[1].split(":")[1];
  let second = segments[1].split(":")[2];
  let hour = segments[1].split(":")[0];
  let day = segments[0].split("-")[2];
  return day + "_" + hour + ":" + minute + "_" + second;
}

setInterval(() => {
  flushBufferToFile();
}, 10000);

/**
 * FILES ARE OF THE FOLLOWING FORMAT
 *  Filename : Date_hour.json
 *  {
 *      remainingTime:{
 *          traceId:{
 *              timeTaken:,
 *              logs:{
 *                  status:Log Object
 *              }
 *          }
 *      }
 *   }
 *
 */
function flushBufferToFile() {
  let formattedLogs = {};
  logBuffer.forEach(log => {
    if (!formattedLogs[log.traceId]) {
      formattedLogs[log.traceId] = {
        traceId: log.traceId,
        logs: {
          [log.type]: log
        }
      };
    } else {
      formattedLogs[log.traceId].logs[log.type] = log;
    }
  });
  if (Object.keys(formattedLogs).length === 0) {
    return;
  }
  let flushableLogs = {};
  let flushableTraceIds = [];
  Object.values(formattedLogs).forEach(action => {
    if (!action.logs["NODE_INITIATED"]) {
      console.log("Headless call detected - ", action.traceId);
      flushableTraceIds.push(action.traceId);
    }
    else if (action.logs["NODE_COMPLETE"] || action.logs["NODE_FAILED"]) {
      action.endTime = (
        action.logs["NODE_COMPLETE"] || action.logs["NODE_FAILED"]
      ).time;
      action.timeTaken =
        new Date(action.endTime) - new Date(action.logs["NODE_INITIATED"].time);
      if (!flushableLogs[getIndexString(action.endTime)]) {
        flushableLogs[getIndexString(action.endTime)] = {
          [action.traceId]: action
        };
      } else {
        flushableLogs[getIndexString(action.endTime)][action.traceId] = action;
      }
      flushableTraceIds.push(action.traceId);
    }
    else{
      let life=Date.now()-action.logs["NODE_INITIATED"].accurateTime;
      let allowedLife = process.env.HERA_callLife || 10800000;
      if(life>allowedLife){
        console.log("Long call detected - ",action.traceId);
        flushableTraceIds.push(action.traceId);
      }
    }
  });
  if(flushableLogs.length===0){
    return;
  }
  writeLogToFile(flushableLogs);
  console.log(flushableTraceIds.length+" logs were flushed");
  let newBuffer = logBuffer.filter(log => {
    return !flushableTraceIds.includes(log.traceId);
  });
  logBuffer = newBuffer;
}

function writeLogToFile(logs) {
  let writeBatches = {};
  Object.keys(logs).forEach(logTime => {
    let fileName = logTime.split(":")[0];
    let searchIndex = logTime.split(":")[1];
    if (!writeBatches[fileName]) {
      writeBatches[fileName] = {
        [searchIndex]: logs[logTime]
      };
    } else {
      writeBatches[fileName][searchIndex] = logs[logTime];
    }
  });
  Object.keys(writeBatches).forEach(fileName => {
    writeBatchToFile(fileName, writeBatches[fileName]);
  });
}

module.exports = addEntry;
