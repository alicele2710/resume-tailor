const express = require('express');
const isAuthenticated = require('../middlewares/isAuthenticated');
const { handleStripePayment, handleFreeSubscription, verifyPayment } = require('../controllers/handleStripePayment');


// console.log('register function:', register); // Add this log to check if register is defined
const stripeRouter = express.Router();
stripeRouter.post('/checkout', isAuthenticated,handleStripePayment);
stripeRouter.post('/free-plan', isAuthenticated,handleFreeSubscription);
stripeRouter.post('/verify-payment/:paymentId', isAuthenticated,verifyPayment);


// console.log('openAIRouter before export:', openAIRouter);

module.exports = stripeRouter;
// //check
// const checkExport = require('./usersRouter');
// console.log('usersRouter after export:', checkExport);