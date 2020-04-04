let uuidV4 = require("uuid/v4");
let {
  expressRequestAdapter,
  axiosRequestAdapter,
  axiosResponseAdapter,
  axiosErrorAdapter
} = require("./adapter");
let addEntry = require("./logManager")

function registerNodeAction(expressRequest) {
  let { method, url, headers, request } = expressRequestAdapter(expressRequest);
  let traceId = uuidV4();
  expressRequest.hTId = traceId;
  addEntry(traceId, "NODE_INITIATED", method, url, headers, request);
}
function initiateAPIAction(axiosRequest) {
  if(!axiosRequest.sourceRequest){
    return;
  }
  let { traceId, method, url, headers, request } = axiosRequestAdapter(
    axiosRequest
  );
  axiosRequest.headers.hTId = traceId;
  addEntry(traceId, "API_INITIATED", method, url, headers, request);
}
function completeAPIAction(axiosResponse) {
  let {
    traceId,
    method,
    url,
    headers,
    request,
    responseCode,
    response
  } = axiosResponseAdapter(axiosResponse);
  addEntry(
    traceId,
    "API_COMPLETE",
    method,
    url,
    headers,
    request,
    responseCode,
    response
  );
}
function errorAPIAction(errorResponse) {
  let {
    traceId,
    method,
    url,
    headers,
    request,
    errorCode,
    errorMessage
  } = axiosErrorAdapter(errorResponse);
  addEntry(
    traceId,
    "API_FAILED",
    method,
    url,
    headers,
    request,
    errorCode,
    errorMessage
  );
}
function errorNodeAction(expressRequest, expressError, data) {
  let { traceId,method, url, headers, request } = expressRequestAdapter(expressRequest);
  addEntry(
    traceId,
    "NODE_FAILED",
    method,
    url,
    headers,
    request,
    expressError.statusCode,
    data
  );
}
function completeNodeAction(expressRequest, expressResponse, data) {
  let { traceId,method, url, headers,request  } = expressRequestAdapter(expressRequest);
  addEntry(
    traceId,
    "NODE_COMPLETE",
    method,
    url,
    headers,
    request,
    expressResponse.statusCode,
    data
  );
}

module.exports = {
  registerNodeAction,
  initiateAPIAction,
  completeAPIAction,
  errorAPIAction,
  errorNodeAction,
  completeNodeAction
};
