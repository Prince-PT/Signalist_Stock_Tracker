import nodemailer from "nodemailer";
import { WELCOME_EMAIL_TEMPLATE } from "./template";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
    },
})

export const sendWelcomeEmail = async ({email, name , intro}: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace('{{name}}', name).replace('{{intro}}', intro);

    const mailOptions = {
        from: process.env.NODEMAILER_USER,
        to: email,
        subject: "Welcome to Signalist!",
        text: "Welcome to Signalist! We're excited to have you on board.",
        html: htmlTemplate,
    }

    await transporter.sendMail(mailOptions);
}