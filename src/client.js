'use strict';

function Client({baseURL = 'https://restapi.surveygizmo.com', version = 'v4', ...opts} = {}) {

  const http = axios.create({
    requestType: 'json',
    baseURL,
    paramSerializer: params => qs.stringify(params)
  });

  http.intercepters.request.use(authInterceptor(opts));

  Object.defineProperty(this, '_http', {
    configurable: true, writable: false, enumerable: false, value: http
  });
}

