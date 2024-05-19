const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const checkApiRequestLimit = asyncHandler(async(req, res, next)=>{
    if(!req.user){
        return res.status(401).json({message: "not authorized"})
    }
    //find the user
    const user = await User.findById(req?.user?.id);
    if(!user){
        return res.status(404).json({message: "user not found"})
    }
    let requestLimit = 0
    //check if user is on trial period
    if(user?.trialActive){
        requestLimit = user?.monthlyRequestCount;
    }
    //check if user has exceeded monthly requests
    if(user?.apiRequestCount >= requestLimit){
        throw new Error('api request limit reached, please subscribe to a plan');

    }
    next();
});

module.exports = checkApiRequestLimit;