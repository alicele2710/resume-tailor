//------Registration-----
const bcryp = require("bcryptjs");
const User = require('../models/User');
const jwt = require("jsonwebtoken");

const asyncHandler = require("express-async-handler");


// console.log("Loading usersController.js"); // Log when the file is loaded

const register = asyncHandler(async (req, res) => {

        const {username, email, password} = req.body;
        //validate
        if(!username ||!email ||!password){
            res.status(400);
            throw new Error("all fields are required");
        }
        //check if email is taken
        const userExists = await User.findOne({ email });
        if(userExists){
            res.status(400);
            throw new Error("user already exists");

        }
        // hash user password
        const salt = await bcryp.genSalt(10);
        const hashedPassword = await bcryp.hash(password, salt)
        //create user
        const newUser = new User({
            username, 
            password: hashedPassword,
            email,
        });
        //add the date the trial will end 
        newUser.trialExpires = new Date(
            new Date().getTime() + newUser.trialPeriod * 24 * 60 * 60 * 1000
        );
        //save user
        await newUser.save()

        res.json({
            status: true,
            message: "registration was successfull",
            user:{
                username, 
                email,
            },
        });
        
});

//------Login------------

const login = asyncHandler(async(req, res)=>{
    const{email, password} = req.body
    //check user email
    const user = await User.findOne({email})
    console.log(user);
    if(!user){
        res.status(401)
        throw new Error('Invalid email or password')
    }
    //check user password
    const isMatch = await bcryp.compare(password, user?.password    )
    if(!isMatch){
        res.status(401)
        throw new Error('Invalid email or password')
    }
    console.log(`JWT Secret in login: ${process.env.JWT_SECRET}`);
    //generate token (jwt)
    const token = jwt.sign({id: user?._id}, process.env.JWT_SECRET, {
        expiresIn: '3d'//token expires in 3 days
    });
    console.log(token)
    //set the token into cookie (http)
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict',
        maxAge: 24* 60* 60 *1000, //1day in miliseconds 
    
    })
    //send the response 
    res.json({
        status: 'success',
        _id: user?._id,
        message: 'login success',
        username: user?.username,
        email: user?.email,
    })

})
//------Logout------------
const logout = asyncHandler(async(req, res)=>{
    res.cookie('token', '', {maxAge: 1});
    res.status(200).json({message:"logout successfully"});
})
//------Profile------------
const userProfile = asyncHandler(async(req, res)=>{


    const user = await User.findById(req?.user?.id)
        .select('-password')
        .populate('payments')
        .populate('contentHistory');
    if(user){
        res.status(200).json({
            status: "success",
            user,
        })
    }else{
        res.status(404);
        throw new Error('User not found');
    }
});
//------Check User Auth Status------------

const checkAuth = asyncHandler(async(req, res)=>{
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    if(decoded){
        res.json({
            isAuthenticated: true,

        })
    }else{
        res.json({
            isAuthenticated: false,
            
        })
    }
})
// console.log("register function defined:", register); // Log when the function is defined
module.exports = {
    register,
    login,
    logout,
    userProfile,
    checkAuth,
};