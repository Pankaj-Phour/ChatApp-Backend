require('dotenv').config();
const socketIo = require('socket.io');
const { Vonage } = require('@vonage/server-sdk')
const express = require('express');
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const mongoose = require('mongoose');


const app = express();
app.use(cors())
app.use(express.json({limit:'200mb'}))

mongoose.set('strictQuery', false);
mongoose.connect(`mongodb+srv://${process.env.MONGO}`,(req,res)=>{
    console.log("Mongo DB connection established");
})

const user = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    contact:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    sending:{
        type:String,
        required:false,
        default:''
    },
    messageList:{
        type:Array,
        required:false,
        default:[]
    },
    lastMessage:{
        type:String,
        required:false,
        default:''
    },
    index:{
        type:String,
        required:false,
        default:''
    }
})

const userModel = mongoose.model('chatAppUser',user);

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

app.post('/signup',async (req,res)=>{
    console.log(req.body,"Hello from signup");
    const data = req.body;
    if(data.contact && data.email && data.password && data.name){
        // sendSMS(data.contact);
        const previousUsers = await userModel.find().lean();
        console.log("Previous users--------------->>>>>",previousUsers,data);
        const previous = previousUsers.filter((user)=>{
            return user.email === data.email
        })
        console.log(previous);
        if(previous.length>0){
            res.status(200).send({
                code:422,
                error:true,
                message:'Your account is already registered with us. Please sign In to continue.'
            })
        }
            else{
            const user = new userModel({
                name:data.name,
                email:data.email,
                password:data.password,
                contact:data.contact
            })
            user.save();
            res.status(200).send({
                code:200,
                error:false,
                message:`OTP sent successfully to ${data.contact}`
            })
        }
        }
    else{
        res.status(200).send({
            code:404,
            error:true,
            message:"Please fill all the information, name,email,contact and password"
        })
    }
})
app.post('/signin', async (req,res)=>{
    console.log(req.body,"Hello from signin");
    const data = req.body;
    if(data.contact){
        const alUsers = await userModel.find().lean();
        console.log("All users--------->>>>>>",allUsers);
        const previousUser = allUsers.filter((user)=>{
            return user.contact === data.contact
        })
        if(previousUser.length>0){
            sendSMS(data.contact);
            res.status(200).send({
                code:200,
                error:false,
                message:`OTP sent successfully to ${data.contact}`
            })
        }
        else{
            res.status(200).send({
                code:404,
                error:true,
                message:'Your account is not registered with us. Please sign up to continue.'
            })
        }
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

app.get('/allUsers', async(req,res)=>{
    const allUsers = await userModel.find().lean();
    console.log("All users------>>>>>>",allUsers);

    res.status(200).send({
        code:200,
        error:false,
        message:"All users data fetched successfully",
        response:allUsers
    })
})

const serverConnection =  app.listen(PORT)

const io = socketIo(serverConnection,{cors:{origin:['http://localhost:9518']}});


io.on('connection',(socket)=>{
    // console.log(socket);
    console.log("firstClient",{data:'Hello form web no eLQBA6rw7k2wVaLB'});
    // console.log(socket.handshake);
})

// app.listen(PORT,{cors:{origin:['http:192.168.1.56:9518']}},()=>{
//     console.log("Listening on port ",PORT);
// })