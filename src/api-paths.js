'use strict';

const survey = ({surveyId = ''} = {}) =>
  `/survey/${surveyId}`;

const question = ({surveyId, questionId = ''} = {}) =>
  `${survey({surveyId})}/surveyquestion/${questionId}`;

const option = ({surveyId, questionId, optionId =''} = {}) =>
  `${question({surveyId, questionId})}/surveyoption/${optionId}`;

const response = ({surveyId, responseId = ''} = {}) =>
  `${survey({surveyId})}/surveyresponse/${responseId}`;

const accountObject = () => '/account';

const accountUser = ({accountUserId = ''} = {}) => `/accountuser/${userId}`;

const statistics = ({surveyId = ''} = {}) => `/survey/${surveyId}/surveystatistic`;

module.exports = { survey, question, option, response, accountUser, accountObject, statistics };