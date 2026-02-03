const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Configuration du transporteur (Gmail)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL, // Ton email
            pass: process.env.SMTP_PASSWORD // Ton mot de passe d'application (16 lettres)
        }
    });

    // 2. Options du message
    const mailOptions = {
        from: `LearniX <${process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message // Important : html, pas text
    };

    // 3. Envoi
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé avec succès à : ${options.email}`);
};

module.exports = sendEmail;