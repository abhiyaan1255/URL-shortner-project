import nodemailer from "nodemailer"
const testAccount=await nodemailer.createTestAccount();
    // Create a SMTP transporter object
 const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure:false,
    auth: {
        user: 'ceasar.frami15@ethereal.email',
        pass: 'acp4ny9tQD4zSv9k6g'
    }
});

export const sendEmail=async({to,subject,html})=>{
 const info=await transporter.sendMail({
    from:`URL SHORTNER ${testAccount.user}`,
    to,
    subject,
    html
 })
 const testEmailURL=nodemailer.getTestMessageUrl(info)
 console.log("VerifyEmail",testEmailURL);
 
}
