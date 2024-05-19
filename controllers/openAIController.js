const asyncHandler = require('express-async-handler');
const ContentHistory = require("../models/ContentHistory");
const axios = require('axios');
const User = require('../models/User');

//-----OpenAI controller------
const openAIController = asyncHandler(async(req, res)=>{
    console.log(req.user);
    const {prompt} = req.body
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions',{
            model: 'gpt-4',
            // prompt,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 5
        },{
            headers:{
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': "application/json"
            }
        });
         //send the response back to user
         const content = response.data.choices[0].message.content.trim();
        //create the history
        const newContent = await ContentHistory.create({
            user: req?.user?._id,
            content,

        })
        console.log(response.data);
        //push content history into the user
        const userFound = await User.findById(req?.user?.id);
        userFound.contentHistory.push(newContent?._id);
        //update user request count
        userFound.apiRequestCount += 1
        await userFound.save();

       
        res.status(200).json({ content });
        
    } catch (error) {
        throw new Error(error)
    }
});

module.exports = {
    openAIController,
}