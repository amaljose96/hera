var fs = require("fs");
function writeBatchToFile(fileName, batch) {
  let logPath =
    process.env.HERA_dev === "true" ? "logs" : "./node_modules/hera/logs";
  !fs.existsSync(logPath) && fs.mkdirSync(logPath);
  fs.readFile(logPath + "/" + fileName + ".json", (error, response) => {
    if (error) {
      fs.writeFile(
        logPath + "/" + fileName + ".json",
        JSON.stringify(batch, null, 2)
      );
    } else {
      let existingLog = JSON.parse(response);
      Object.keys(batch).forEach(searchIndex => {
        let timeLogs = batch[searchIndex];
        if (existingLog[searchIndex]) {
          Object.keys(timeLogs).forEach(traceId => {
            existingLog[searchIndex][traceId] = timeLogs[traceId];
          });
        } else {
          existingLog[searchIndex] = timeLogs;
        }
      });
      fs.writeFile(
        logPath + "/" + fileName + ".json",
        JSON.stringify(existingLog, null, 2)
      );
    }
  });
}

module.exports = writeBatchToFile;
