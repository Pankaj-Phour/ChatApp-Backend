const { Vonage } = require('@vonage/server-sdk')
const express = require('express');
const PORT = 3000;
const cors = require('cors');
const mongoose = require('mongoose');


const app = express();
app.use(cors())
app.use(express.json({limit:'200mb'}))


mongoose.connect('mongodb://localhost:27017/Pankaj',(req,res)=>{
    // console.log("Mongo DB connection established");
})

const vonage = new Vonage({
    apiKey: '47b5e597',
    apiSecret: 'Pa226cb9dXDMj5tD'
})
let OTP;

async function sendSMS(number){
    OTP = Math.ceil(Math.random() * 4000);
    if(OTP<1000){
        OTP = OTP + 999
    }
    console.log(OTP);
    const from = 'AirPnP';
    const to = number.toString();
    const text = `Your OTP for signing in is ${OTP}`;
    await vonage.sms.send({to,from,text}).then(res=>{
        console.log("Message sent successfully,OTP is: ",OTP,res);
    }).catch(err => console.log("error occurre while sending sms",err))
}

// sendSMS();
app.get('/',(req,res)=>{
    console.log("Hello from Backend");
})

app.post('/signin',(req,res)=>{
    console.log(req.body,"Hello from signin");
    const data = req.body;
    if(data.number){
        sendSMS(data.number);
        res.status(200).send({
            code:200,
            error:false,
            message:`OTP sent successfully to ${data.number}`
        })
    }
    else{
        res.status(200).send({
            code:404,
            error:true,
            message:"Number not provided"
        })
    }
})

app.post('/otpChecker',(req,res)=>{
    console.log(req.body,"OTP Checker");
    const data = req.body;
    if(data.otp){
        if(data.otp !== OTP){
            res.status(200).send({
                error:true,
                message:"Invalid OTP",
                code:404
            })
        }
        else{
            res.status(200).send({
                code:200,
                error:false,
                message:"Signed In successfully"
            })
        }
    }
    else{
        res.status(200).send({
            code:404,
            error:true,
            message:"OTP not provided"
        })
    }
})


app.listen(PORT,{cors:{origin:['http:192.168.1.56:9518']}},()=>{
    console.log("Listening on port ",PORT);
})