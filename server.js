const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();
const usersRouter = require('./routes/usersRouter');
const { errorHandler } = require('./middlewares/errorMiddleware');
const openAIRouter = require('./routes/openAIRouter');
const stripeRouter = require('./routes/stripeRouter');
const User = require('./models/User');

// const User = require('./models/user');
require('./utils/connectDB')();
// connectDB()
const app = express();
const PORT = process.env.PORT || 8091;

//cron for the trial period, run every day 

cron.schedule("0 0 * * * *", async() =>{

    try {
        //get current date
        const today = new Date();
        await User.updateMany({
            trialActive:true,
            trialExpires:{$lt: today},
        },{
            trialActive:true,
            subscriptionPlan: 'Free',
            monthlyRequestCount: 5
        })
       
    } catch (error) {
        console.log(error);
    }
})
//cron for free plan run at the end of every month
cron.schedule("0 0 1 * * *", async() =>{

    try {
        //get current date
        const today = new Date();
        await User.updateMany({
            subscriptionPlan:'Free',
            nextBillingDate:{$lt: today},
        },{

            monthlyRequestCount: 0,
        })

    } catch (error) {
        console.log(error);
    }
})
//cron for the basic plan 
cron.schedule("0 0 1 * * *", async() =>{
 
    try {
        //get current date
        const today = new Date();
        await User.updateMany({
            subscriptionPlan:"Basic",
            nextBillingDate:{$lt: today},
        },{

            monthlyRequestCount: 0
        })

    } catch (error) {
        console.log(error);
    }
})
//cron for the premium plan 
cron.schedule("0 0 1 * * *", async() =>{
 
    try {
        //get current date
        const today = new Date();
        await User.updateMany({
            subscriptionPlan:"Premium",
            nextBillingDate:{$lt: today},
        },{

            monthlyRequestCount: 0
        })

    } catch (error) {
        console.log(error);
    }
})
//--------middleware-----------
app.use(express.json()); //pass incoming json data
app.use(cookieParser()); //pass the cookie automatically
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
};
app.use(cors(corsOptions));

// console.log('usersRouter:', usersRouter);
//------Routes--------
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/openai', openAIRouter);
app.use('/api/v1/stripe', stripeRouter);

console.log(`JWT Secret: ${process.env.JWT_SECRET}`); 
//------Error Handler Middleware------
app.use(errorHandler);

//start the server
app.listen(PORT, console.log(`server is running on ${PORT}`));

