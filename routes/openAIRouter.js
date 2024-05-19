const express = require('express');
const isAuthenticated = require('../middlewares/isAuthenticated');
const { openAIController } = require('../controllers/openAIController');
const checkApiRequestLimit = require('../middlewares/checkApiRequestLimit');

// console.log('register function:', register); // Add this log to check if register is defined
const openAIRouter = express.Router();
openAIRouter.post('/generate-content', isAuthenticated,checkApiRequestLimit ,openAIController);
// //
// console.log('openAIRouter before export:', openAIRouter);

module.exports = openAIRouter;
// //check
// const checkExport = require('./usersRouter');
// console.log('usersRouter after export:', checkExport);