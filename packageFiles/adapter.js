function expressRequestAdapter(expressRequest) {
  let requestData = { body: expressRequest.body, query: expressRequest.query };
  return {
    traceId: expressRequest.hTId,
    method: expressRequest.method,
    url: expressRequest.originalUrl,
    request: requestData,
    headers: expressRequest.headers
  };
}
function axiosRequestAdapter(axiosRequest) {
  let requestData = { body: axiosRequest.body, query: axiosRequest.query };
  let traceId = axiosRequest.sourceRequest.hTId;
  return {
    traceId,
    method: axiosRequest.method,
    url: axiosRequest.url,
    request: requestData,
    headers: axiosRequest.headers
  };
}
function axiosResponseAdapter(axiosResponse) {
  let requestData = {
    body: axiosResponse.config.body,
    query: axiosResponse.config.query,
    data: axiosResponse.config.data
  };
  return {
    traceId: axiosResponse.config.headers.hTId,
    method: axiosResponse.config.method,
    url: axiosResponse.config.url,
    headers: axiosResponse.headers,
    request: requestData,
    responseCode: axiosResponse.status,
    response: axiosResponse.data
  };
}
function axiosErrorAdapter(errorResponse) {
  let request = {
    body: errorResponse.config.body,
    query: errorResponse.config.query,
    data: errorResponse.config.data
  };
  let errorCode = errorResponse.code;
  let errorMessage = errorResponse.message;
  if (errorResponse.response) {
    errorCode = errorResponse.response.status;
    errorMessage = errorResponse.response.data;
  }
  return {
    traceId: errorResponse.config.headers.hTId,
    method: errorResponse.config.method,
    url: errorResponse.config.url,
    headers: errorResponse.config.headers,
    request,
    errorCode,
    errorMessage
  };
}
module.exports = {
  expressRequestAdapter,
  axiosRequestAdapter,
  axiosResponseAdapter,
  axiosErrorAdapter
};
