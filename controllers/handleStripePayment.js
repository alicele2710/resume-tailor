
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { calculateNextBillingDate } = require('../utils/calculateNextBillingDate');
const { shoudRenewSubscriptionPlan } = require('../utils/shouldRenewSubscriptionPlan');
const Payment = require('../models/Payment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


// console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY); 

//--------Stripe payment-----------
const handleStripePayment = asyncHandler(async(req, res)=>{
    const {amount, subscriptionPlan} = req.body;
    //get the user
    const user = req?.user;
    // console.log(user);
    try {
        //create payment intent
        const paymentIntents = await stripe.paymentIntents.create({
            amount: Number(amount) * 100,
            currency: 'usd',
            //add metadata object
            metadata:{
                userId: user?._id?.toString(),
                userEmail: user?.email,
                subscriptionPlan
            }

        });
        console.log(paymentIntents);
        //send response
        res.json({
            clientSecret: paymentIntents?.client_secret,
            paymentId: paymentIntents?.id,
            metadata: paymentIntents?.metadata,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({error:error});
    }


});

//-------verify payment---------------
const verifyPayment = asyncHandler(async(req, res)=>{
    const {paymentId} = req.params;
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        if(paymentIntent.status === 'succeeded'){
            //get the info metadata
            const metadata = paymentIntent?.metadata;
            const subscriptionPlan = metadata?.subscriptionPlan;
            const userEmail = metadata?.userEmail;
            const userId = metadata?.userId;
            //find the user
            const userFound = await User.findById(userId);
            if(!userFound){
                return res.status(404).json({
                    status: 'false',
                    message: 'user not found',
                })
            }
            //get the payment detail
            const amount = paymentIntent?.amount/100;
            const currency = paymentIntent?.currency;
            const paymentId = paymentIntent?.id;
            //create payment history
            const newPayment = await Payment.create({
                user: userId,
                email: userEmail,
                subscriptionPlan,
                amount,
                currency,
                status: 'success',
                reference: paymentId,
            })
            //check for the subscription plan
            if(subscriptionPlan === 'Basic'){
                //update the user
                const updatedUser = await User.findByIdAndUpdate(userId,{
                    subscriptionPlan,
                    trialPeriod: 0,
                    nextBillingDate: calculateNextBillingDate(),
                    apiRequestCount:0,
                    monthlyRequestCount: 50,
                    subscriptionPlan: 'Basic',
                    $addToSet:{payments: newPayment?._id},  
                });
                res.json({
                    status: true,
                    message: "payment verified, updated user",
                    updatedUser,
                })
        }
            if(subscriptionPlan === 'Premium'){
        //update the user
        const updatedUser = await User.findByIdAndUpdate(userId,{
            subscriptionPlan,
            trialPeriod: 0,
            nextBillingDate: calculateNextBillingDate(),
            apiRequestCount:0,
            monthlyRequestCount: 100,
            subscriptionPlan: 'Premium',
            $addToSet:{payments: newPayment?._id},  
        });
        res.json({
            status: true,
            message: "payment verified, updated user",
            updatedUser,
        })
}
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error});
        
    }
});

//---------handle free subscription-----------
const handleFreeSubscription = asyncHandler(async(req, res)=>{
    //get user
    const user = req?.user;
    //check if user account should be renew or not
    try {
        if(shoudRenewSubscriptionPlan(user)){
            //update user account
            user.subscriptionPlan = 'Free';
            user.monthlyRequestCount = 5;
            user.apiRequestCount = 0;
            //calculate next billing date
            user.nextBillingDate =  calculateNextBillingDate();
            //create new payment save into DB
            const newPayment = await Payment.create({
                user: user?._id,
                subscriptionPlan: 'Free',
                amount: 0,
                status: 'success',
                reference: Math.random().toString(36).substring(7),
                monthlyRequestCount:5,
                currency: 'usd',
                
            });
            user.payments.push(newPayment?._id);
            //save user
            await user.save();
             //send response
            res.json({
            status: 'success',
            message: 'subscription plan updated successfully',
        })
        
        
       

        }else{
            return res.status(403).json({error:'subscription not due yet'})
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error});
        
    }

});
module.exports = { handleStripePayment, handleFreeSubscription, verifyPayment };