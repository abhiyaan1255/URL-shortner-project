import nodemailer from "nodemailer"


// Generate SMTP service account from ethereal.email
// const testAccount =  nodemailer.createTestAccount((err, account) => {
//     if (err) {
//         console.error('Failed to create a testing account. ' + err.message);
//         return process.exit(1);
//     }

//     console.log('Credentials obtained, sending message...');
// });

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

    // Message object
    // let message = {
    //     from: 'Sender Name <sender@example.com>',
    //     to: 'Recipient <recipient@example.com>',
    //     subject: 'Nodemailer is unicode friendly ✔',
    //     text: 'Hello to myself!',
    //     html: '<p><b>Hello</b> to myself!</p>'
    // };

//   const info=  transporter.sendMail(message, (err, info) => {
//         if (err) {
//             console.log('Error occurred. ' + err.message);
//             return process.exit(1);
//         }

//         console.log('Message sent: %s', info.messageId);
//         // Preview only available when sending through an Ethereal account
//         console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
//     });


// });

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
