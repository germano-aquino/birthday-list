import request from "./request.js";
import email from "./email.js";

await main();

async function main() {
  try {
    const birthdayList = await request.getBirthdayList();
    await email.send(birthdayList);
  } catch (error) {
    console.log("Falha ao gerar lista de aniversariantes do mês.");
    console.log(error.message);
    console.log(error);
  }
}
