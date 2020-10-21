const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomEmail = (email, name) => {
    sgMail.send({
        to: email, 
        from: process.env.MYEMAIL, 
        subject: "Thanks for joining in!", 
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}


const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email, 
        from: process.env.MYEMAIL, 
        subject: `Sorry to see you go, ${name}!`, 
        text: "Thanks for using the app. I hope to see you back sometime soon."     
    })
}

module.exports = {
    sendWelcomEmail, 
    sendCancelEmail
}