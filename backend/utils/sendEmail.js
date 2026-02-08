const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, 
        auth: {
            user: 'hanadjib70@gmail.com', 
            pass: 'gugfsblywjebomfc'      
        }
    });

    const message = {
        from: 'LearniX <hanadjib70@gmail.com>',
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    console.log(" Envoi de l'email via Gmail en cours...");
    await transporter.sendMail(message);
    console.log("Email envoyé avec succès !");
};

module.exports = sendEmail;