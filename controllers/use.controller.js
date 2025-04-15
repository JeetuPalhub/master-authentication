// register controller
import User from "../models/user.models.js";
import crypto from "crypto";
import sendVerificationEmail from "../utils/sendMail.utils.js";
import jwt from "jsonwebtoken";

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
            email,
        })
        console.log("existing user");
        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already exists"
            })
        }

        //2.User verification token
        const token = crypto.randomBytes(32).toString("hex");
        console.log("token created success");
        const tokenExpiry = Date.now() + 10 * 60 * 60 * 1000;

        //3.create a new user 
        const user = await User.create({
            name,
            email,
            password,
            verificationToken: token,
            verificationTokenExpiry: tokenExpiry,
        })

        console.log("user created success", user)

        if(!user) {
            return res.status(200).json({
                success: false,
                message: "User not created",
            })
        }

        //send mail
        await sendVerificationEmail(user.email, token);
        console.log("email send success");

        // response to user
        return res.status(200).json({
            success: true,
            message: "User registered successfully, now yo have to verify your email"
        })


    } catch (error) {
        console.log(error.message);
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
    //1.get user data
    const { email, password } = req.body;

    //2.validate
    if(!email || !password){
        return res.status(400).json({
            success: false,
            message: "all field required"
        })
    }


    try {
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({
                success: false,
                message: "user not found"
            })
        }

        //check if user verified
        if(!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "user not found",
            })
        }

        //check password
       
        const isPasswordMatch = await user.comparePassword(password);
        console.log("password match,", isPasswordMatch);
        if(!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "password is not correct",
            })
        }


        //jwt token
        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "15m"
    })

    // set cookie
    const cookieOptions = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true, // XSS attacks
    }
    res.cookie("jwtToken", jwtToken, cookieOptions)
    return res.status(200).json({
        success: true,
        message: "Login successfull"
    })
    } catch (error) {
      return res.status(500).json({
        success: true,
        message: "Interval server error",
      })  
    }
};

//get profile controller
const getProfile = async (req, res) => {
//get user id from request object
const userId = req.user.id

const user = await User.findById(userId).select("-password")

if(!user) {
    return res.status(400).json({
        success: false,
        message: "password is not correct",
    })
}
return res.status(200).json({
    success: true,
    message: "user profile access"
})
}

export { register, verify, login, getProfile };