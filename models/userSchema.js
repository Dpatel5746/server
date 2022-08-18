const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Schema Or Document Structure
const userSchema = new mongoose.Schema({
    username : {
        type : String,
        require : true,
        unique : true 
    },
    email : {
        type : String,
        require : true,
        unique : true 
    },
    password : {
        type : String,
        require : true
    },
    tokens : [
        {
            token : {
                type : String,
                require: true
            }
        }
    ]
})

// Hashing passwrod to secure
userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = bcryptjs.hashSync(this.password, 10);
    }
    next();
})

// Generate  Tokens to Verify user
userSchema.methods.generateToken = async function(){
    try {
        let generatedToken = jwt.sign({_id : this._id}, process.env.SECURE_KEY);
        this.tokens = this.tokens.concat({token : generatedToken});
        await this.save;
        return generatedToken;
    } catch (error) {
        console.log(error);
    }
}

// Create Model
const Users = new mongoose.model("USER", userSchema);

module.exports = Users;





