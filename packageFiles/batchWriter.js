var fs = require("fs");
function writeBatchToFile(fileName, batch) {
  let logPath =
    process.env.HERA_dev === "true" ? "logs" : "./node_modules/hera/logs";
  !fs.existsSync(logPath) && fs.mkdirSync(logPath);
  fs.readFile(logPath + "/" + fileName + ".json", (error, response) => {
    if (error) {
      fs.writeFile(
        logPath + "/" + fileName + ".json",
        JSON.stringify(batch, null, 2),
        (err) => {
          if(err){
            console.error("Failed to write file at ",
            process.cwd() + "/" + logPath + "/" + fileName + ".json")
          }
          else{

            console.log(
              "Log file created successfully at ",
              process.cwd() + "/" + logPath + "/" + fileName + ".json"
            );
          }
        }
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
        JSON.stringify(existingLog, null, 2),
        (err) => {
          if(err){
            console.error("Failed to write file at ",
            process.cwd() + "/" + logPath + "/" + fileName + ".json")
          }
          else{

            console.log(
              "Log file updated successfully at ",
              process.cwd() + "/" + logPath + "/" + fileName + ".json"
            );
          }
        }
      );
    }
  });
}
setInterval(() => {
  cleanUp();
}, 60000);

function cleanUp() {
  let logPath =
    process.env.HERA_dev === "true" ? "logs" : "./node_modules/hera/logs";
  let historyLimit = process.env.HERA_historyLimit || 7;
  let possibleFileNames = ["logPresence"];
  for (var day = 0; day <= historyLimit; day = day + 1) {
    let date = new Date();
    date.setDate(new Date().getDate() - day);
    date = date.getDate();
    for (var hour = 0; hour < 24; hour = hour + 1) {
      possibleFileNames.push(date + "_" + hour + ".json");
    }
  }
  fs.readdir(logPath, (err, files) => {
    if (err) {
      console.error(
        "Cleanup failed. Please clean up manually to prevent disk space exhaustion"
      );
    } else {
      let weed = files.filter(fileName => {
        return !possibleFileNames.includes(fileName);
      });
      weed.forEach(weedFileName => {
        console.log("Hera Weed Remover removed " + weedFileName);
        fs.unlink(logPath + "/" + weedFileName);
      });
    }
  });
}
module.exports = writeBatchToFile;
