import nodemailer from "nodemailer";

async function send(birthdayList) {
  let mailBody = "Os aniversariantes do próximos mês do clube depil são:";
  for (const [name, date] of Object.entries(birthdayList)) {
    mailBody += `\n\t${name}: ${date}`;
  }
  mailBody += "\n\nAtt GermaBot";

  const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Germano Aquino" <${process.env.MAIL_USER}>`,
    to: [`<${process.env.MAIL_RECIPIENT}>`],
    subject: "Aniversariantes do Próximo Mês",
    text: mailBody,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) throw error;
    console.log("Email enviado com sucesso!");
    console.log("Message ID:", info.messageId);
  });
}

const email = { send };

export default email;
