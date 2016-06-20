'use strict';
const qs         = require('qs');
const {compose} = require('transducers.js');
const axios      = require('axios');
const md5        = require('md5');
const paths      = require('./api-paths');
const Rx         = require('rxjs/Rx');
const is = require('is');

const {filter, Filter, operators} = require('./filter');


const authSetter = authConfig => config =>
  ({...config, params: {...config.params, ...authConfig } });

const authInterceptor = compose(authSetter, authConfig);

// const morePages = response => response && response.page && response.total_pages && response.page < response.total_pages,



function authConfig({apiToken, apiTokenSecret, api_token, api_token_secret }) {
  const auth = { api_token: api_token || apiToken, api_token_secret: api_token_secret || apiTokenSecret };
  if (!auth.api_token || !auth.api_token_secret) {
    throw new Error('api_token and api_token_secret are required'); 
  }
  return auth;
}


const handleHttpStatus = result => {
  if (!result.status || result.status >= 400 || !result.data.result_ok || result.data.code >= 400 ) {
    return Promise.reject(result.data);
  }
  return result && result.data ? result.data : result;
};

const proto = {

  /**
   * [getSurvey description]
   * @param  {[type]} surveyId [description]
   * @param  {object} options  { }
   * @return {[Promise]} Results of HTTP request
   */
  getSurvey(surveyId) {
    return this.get(paths.survey({surveyId}));
  },

  /**
   * [getSurveys description]
   * @param  {integer} options.resultsperpage Results per page
   * @param  {integer} options.page           Page #
   * @param  {Array} options.filters        Array of filters to use
   * @return {Promise}                       HTTP requests
   */
  getSurveys(params = {}) {
    return this.get(paths.survey(), { params });
  },

  getAllSurveys({ resultsperpage = 500, filter} = {}) {
    const start = new Date();
    const subject = new Rx.Subject();
    const nextPage = (page = 1, totalPages = null) => {
      if (!is.int(totalPages) || page < totalPages) {
        return this.getSurveys({resultsperpage, filter, page }).then(res => {
          subject.next(res.data);
          return nextPage(page + 1, Number(res.total_pages));
        }).catch(err => {
          subject.error(err);
        });
      } else {
        subject.complete({start, end: new Date()});
      }
    };

    nextPage();
    return subject.asObservable();

  },

  getAllResponses(surveyId, { resultsperpage = 200 } = {}) {
    const start = new Date();
    const subject = new Rx.Subject();
    const total = [];
    const nextPage = (page = 1, totalPages = null) => {
      console.log('calling', {page, totalPages});
      if (!is.int(totalPages) || page < totalPages) {
        return this.getResponses(surveyId, {resultsperpage, page}).then(res => {
          const [page, totalPages] = [res.page, res.total_pages].map(x => Number(x));
          subject.next(Rx.Observable.from(res.data));
          console.log('retrieved', {page, totalPages});
          total.push(...res.data);
          return nextPage(page + 1, totalPages);
        }).catch(err => {
          console.error('uh oh', err);
          subject.error(err);
        });
      } else {
        subject.complete({start, end: new Date(), total});
      }
    };

    nextPage();
    return subject.asObservable().concatAll();

  },

  getAllQuestions(surveyId, {resultsperpage = 200, ...params} = {}) {
    const start = new Date();
    const subject = new Rx.Subject();
    let total = [];
    const nextPage = (page = 1, totalPages = null) => {
      if (!is.int(totalPages) || page < totalPages) {
        return this.getQuestions(surveyId, {...params, resultsperpage, page}).then(res => {
          const [page, totalPages] = [res.page, res.total_pages].map(x => Number(x));
          subject.next(Rx.Observable.from(res.data));
          console.log('retrieved', {page, totalPages});
          total = total.concat(res.data);
          return nextPage(page + 1, totalPages);
        }).catch(err => {
          console.error('uh oh', err);
          subject.error(err);
        });
      } else {
        subject.complete({start, end: new Date(), total});
      }
    };

    nextPage();
    return subject.asObservable().concatAll();
  },

  getQuestion(surveyId, questionId, params = {}) {
    const path = paths.question({surveyId, questionId});
    return this.get(path, {params});
  },

  getQuestions(surveyId, params = {}) {
    const path = paths.question({surveyId});
    return this.get(path, {params});
  },

  getOptions(surveyId, questionId) {
    const path = paths.option({surveyId, questionId});
    return this.get(path);
  },

  getOption(surveyId, questionId, optionId) {
    const path = paths.option({surveyId, questionId, optionId});
    return this.get(path);
  },

  getResponses(surveyId, params) {
    const path = paths.response({surveyId});
    return this.get(path, {params});
  },

  getResponse(surveyId, responseId) {
    const path = paths.response({surveyId, responseId});
    return this.get(path);
  },

  getStatistics(surveyId, {pageId, questionId} = {}) {
    const path = paths.statistics({surveyId});
    return this.get(path, {params: { surveypage: pageId, surveyquestion: questionId }});
  },

  request(...args) {
    this.http.request(...args).then(handleHttpStatus);
  },

  get(...args) {
    return this.http.get(...args).then(handleHttpStatus);
  },

  put(...args) {
    return this.http.put(...args).then(handleHttpStatus);
  },

  post(...args) {
    return this.http.post(...args).then(handleHttpStatus);
  },

  delete(...args) {
    return this.http.delete(...args).then(handleHttpStatus);
  }
};

function SurveyGizmoClient({baseURL = 'https://restapi.surveygizmo.com', version = 'v4', ...auth}) {
  baseURL = `${baseURL}/${version}`;
  const http = axios.create({
    requestType: 'json',
    baseURL,
    paramsSerializer: params => qs.stringify(params)
  });

  http.interceptors.request.use(authInterceptor(auth));

  Reflect.defineProperty(this, 'http', {
    configurable: true, writable: false, enumerable: true, value: http
  });
}

/**
 * Create a new client instance
 * @param {Object} config   Configuration
 * @param {String} config.baseURL The SurveyGizmo URL - defaults to 'https://restapi.surveygizmo.com'
 * @param {String} [config.version = 'v4'] API version.
 * @param {String} [config.apiToken] User's API token for SurveyGizmo
 * @param {String} [config.apiTokenSecret] Secret to go with API token.
 * @param {String} [config.username] Username - if not using tokens for auth
 * @param {String} [config.password] Password - if not using tokens for auth
 * @return {Object}  - instance of SurveyGizmo client
 */
SurveyGizmoClient.create =  function create(config) {
  return new SurveyGizmoClient(config);
};

SurveyGizmoClient.prototype = proto;
SurveyGizmoClient.prototype.filter = SurveyGizmoClient.filter = filter;
SurveyGizmoClient.Filter = Filter;

//const svyFilter = require('./filter');
//Object.assign(SurveyGizmoClient, svyFilter);
//Object.assign(SurveyGizmoClient.prototype, svyFilter);
//SurveyGizmoClient.prototype.filter = svyFilter;
//SurveyGizmoClient.filter = svyFilter;

module.exports = SurveyGizmoClient;
