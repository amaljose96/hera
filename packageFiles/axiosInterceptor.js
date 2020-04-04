let {
  initiateAPIAction,
  completeAPIAction,
  errorAPIAction
} = require("./register");
const requestHandler = axiosRequest => {
  initiateAPIAction(axiosRequest);
  return axiosRequest;
};
const errorHandler = error => {
  errorAPIAction(error);
  return Promise.reject(error);
};

const successHandler = response => {
  completeAPIAction(response);
  return response;
};
function axiosInterceptor(axios) {
  const axiosInstance = axios.create();
  axiosInstance.interceptors.request.use(request => requestHandler(request));
  axiosInstance.interceptors.response.use(
    response => successHandler(response),
    error => errorHandler(error)
  );
  return axiosInstance;
}
module.exports = axiosInterceptor;
