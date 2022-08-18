// Import all the dependencies 
const dotenv = require('dotenv');
const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(cors());

// Configure ENV file and require Connection file
dotenv.config({path : "./config.env"});
require("./db/conn");

const port = process.env.PORT;

// Require model
const Users = require('./models/userSchema');
const authenticate = require('./middleware/authenticate');

// these method is used to get data and cookies from frontend
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser());

app.get('/', (req,res)=>{
    res.send("Hello World")    
})

// Registration
app.post('/register', async (req, res)=>{
    try {
        // Get body or data
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        const createUser = new Users({
            username : username,
            email : email,
            password : password
        });

        // Save is used to create User or insert User
        // But before saving or inserting, password will hash
        // Because of hashing. after hash, it will save to DB
        const created = await createUser.save();
        console.log(created);
        res.status(200).send("Registered");

    } catch (error) {
        console.log("Registration Error");
        res.status(400).send(error);
    }
})

// Login user
app.post('/login', async (req, res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;

        //Find if user exist
        const user = await Users.findOne({email : email});
        
        if(user){
            //Verify Password
            const isMatch = await bcryptjs.compare(password, user.password);

            if(isMatch){
                //Generate Token which is define in userSchema
                const token = await user.generateToken();
                res.cookie("jwt", token, {
                    //Expires token in 24 hours
                    expires : new  Date(Date.now() + 86400000),
                    httpOnly : true
                })
                res.status(200).send("LoggedIn")
            }else{
                res.status(400).send("Invalid Credentials");
            }
        }else{
            res.status(400).send("Invalid Credentials");
        }

    } catch (error) {
        res.status(400).send(error);
    }
})

// Logout Page 
app.get('/logout', (req, res) => {
    res.clearCookie("jwt", {path: '/'})
    res.status(200).send("User Logged Out")
})

// Authentication
app.get('/auth', authenticate, (req,res)=>{

})

//run server
app.listen(port, ()=>{
    console.log("Server is Listening")
})

