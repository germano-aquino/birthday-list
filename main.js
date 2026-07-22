import request from "./request.js";
import email from "./email.js";

await main();

async function main() {
  try {
    const [birthdayList, missingBirthdayList] = await request.getBirthdayList();
    await request.sendBirthdayListToN8n(birthdayList);
    await email.send(birthdayList, missingBirthdayList);
  } catch (error) {
    console.log("Falha ao gerar lista de aniversariantes do mês.");
    console.log(error.message);
    console.log(error);
  }
}
