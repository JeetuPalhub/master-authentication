import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    verificationToken: String,
    verificationTokenExpiry: Date,
    },
     {
        timestamps: true,
});

userSchema.pre("save", async function(next){
    if(this.isModified("password")) {
        this.password =await bcrypt.hash(this.password, 10);
        console.log("password hashed");
        next();
    }
})

userSchema.methods.comparePassword = async function(password){
    console.log("password match");
    return await  bcrypt.compare(password, this.password);                                                                                                                                                                                                                                                                                                           bcrypt.compare(password, this.password)
}

const User = mongoose.model("User", userSchema);

export default User;