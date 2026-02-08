import nodemailer from "nodemailer";
import { WELCOME_EMAIL_TEMPLATE, NEWS_SUMMARY_EMAIL_TEMPLATE } from "./template";

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

export const sendNewsSummaryEmail = async (email: string, date: string, newsContent: string) => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date)
        .replace('{{newsContent}}', newsContent);

    const mailOptions = {
        from: '"Signalist News" <thakkarprince100@gmail.com>',
        to: email,
        subject: `Market News Summary Today - ${date}`,
        text: "Today's market news summary from Signalist",
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
}

