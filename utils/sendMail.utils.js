import nodemailer from "nodemailer";

// create transport 
// mailOptions
// send mail

//1. transport 
const sendVerificationEmail = async (email, token) => {
    try {
        // create email transporter
        const transporter = nodemailer.createTransport({
            host: process.env.Email_HOST,
            port: process.env.Email_PORT,
            secure: process.env.Email_SECURE == "true",
            auth: {
                user: process.env.Email_USER,
                pass: process.env.Email_PASS,
            }
        }) 

        // verification URL
        const verificationURL = `${process.env.BASE_URL}/api/v1/users/verify/${token}`;
    
       // email content
        const mailOptions = {
            from: `"Authentication App" <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: "Please verify your email address",
            text: `
            Thank you for registering! Please verify your email address to complete your registration.
            ${verificationURL}
            This verification link will expire  in 10 mins.
            If you did not create an account , please ignore this email.
            `,
        };

        // send email
        const info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent: %s ", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending verification email:", error);
        return false;
    }
};

export default sendVerificationEmail