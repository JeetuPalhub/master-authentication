// register controller
import User from "../models/user.models.js";
import crypto from "crypto";
import sendVerificationEmail from "../utils/sendMail.utils.js";

const register = async (req , res) => {
    //1.get user data from req body
    const { name , email, password } = req.body;


    //2.validate data
    if(!name || !email || !password) {
        return res.status(400).json({
            success: true,
            message: "All fields are required"
        })
    }

    //3.password check
    if(password.length < 6){
        return res.status(400).json({
            success: false,
            message: "Password is not valid"
        })
    }

    try {
        //1.if existing user
        const existingUser = await User.findOne({
            email
        })
        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already exists"
            })
        }

        //2.User verification token
        const token = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = new Date.now() + 10 * 60 * 60 * 1000;

        //3.create a new user 
        const user = await User.create({
            name,
            email,
            password,
            verificationToken: token,
            verificationTokenExpiry: tokenExpiry,
        })

        if(!user) {
            return res.status(200).json({
                success: false,
                message: "User not created",
            })
        }

        //send mail
        await sendVerificationEmail(user.email, token);

        // response to user
        return res.status(200).json({
            success: true,
            message: "User registered successfully, now yo have to verify your email"
        })


    } catch (error) {
        return res.status(500).json({
            success: true,
            message: "Internal server error",
        });
    }

};

// verify controller 
const verify = async (req, res) => {
    try{
        //1. get token from params
        const token = req.params.token

        // get user
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiry: {$gt: Date.now()}
        })

        // is user exist
        if(!user){
            return res.status(200).json({
                success: false,
                message: "token invalid"
            })
        }


        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User account is verified"
        })

    } catch (error) {
        return res.status(500).json({
            success: true,
            message: "Internal server error",
        })
    }
}

// login controller
const login = async(req, res)=> {
    //1.
}

export { register, verify };