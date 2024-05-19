const express = require('express');
const { register , login, logout, userProfile, checkAuth} = require('../controllers/usersController');
const isAuthenticated = require('../middlewares/isAuthenticated');
const usersRouter = express.Router();

// console.log('register function:', register); // Add this log to check if register is defined

usersRouter.post('/register', register);
usersRouter.post('/login', login);
usersRouter.post('/logout', logout);
usersRouter.get('/profile', isAuthenticated, userProfile);
usersRouter.get('/auth/check', isAuthenticated, checkAuth);
// //
// console.log('usersRouter before export:', usersRouter);

module.exports = usersRouter;
// //check
// const checkExport = require('./usersRouter');
// console.log('usersRouter after export:', checkExport);