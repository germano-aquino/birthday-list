import headers from "./headers.js";

import { parse } from "csv-parse/sync";

const urlProfessionalsData =
  "https://www.trinks.com/BackOffice/Download/ExportarProfissionais";

const lojaIds = {
  14: {
    idRelacaoProfissional: "46810",
    idEstabelecimento: "18769",
    idRelacaoProfissionalRecepcionista: "46809",
  },
  batista: {
    idRelacaoProfissional: "103890",
    idEstabelecimento: "35295",
    idRelacaoProfissionalRecepcionista: "103889",
  },
  duque: {
    idRelacaoProfissional: "440885",
    idEstabelecimento: "120037",
    idRelacaoProfissionalRecepcionista: "440884",
  },
  umarizal: {
    idRelacaoProfissional: "49102",
    idEstabelecimento: "19357",
    idRelacaoProfissionalRecepcionista: "49101",
  },
};

const currentDate = new Date();
const month = String(((currentDate.getMonth() + 1) % 12) + 1).padStart(2, "0");

let cookie = headers.Cookie;

function getHeadersForStore(store) {
  const idEstabelecimentoPattern = new RegExp(
    "(?<=idEstabelecimentoPadrao)(.+?)=(.+?)(?=;)",
  );
  cookie = cookie.replace(
    idEstabelecimentoPattern,
    `$1=${lojaIds[store].idEstabelecimento}`,
  );

  return {
    ...headers,
    "id-estabelecimento-autenticado": lojaIds[store].idEstabelecimento,
    Cookie: cookie,
  };
}

function cookieShouldBeSet(response) {
  const setCookie = response.headers.getSetCookie();
  if (setCookie) {
    setCookie.map((ck) => {
      const keyValue = ck.split(";")[0];
      const [key, value] = keyValue.split("=");
      const pattern = new RegExp(`(?<=${key})=(.+?)(?=;)`);
      cookie = cookie.replace(pattern, `=${value}`);
    });
  }
}

async function getBirthdayList() {
  const birthdayList = {};
  const missingBirthdayList = [];

  const body = {
    apenasAtivos: true,
  };

  const encodedBody = new URLSearchParams(body);

  for (const store of Object.keys(lojaIds)) {
    const headers = getHeadersForStore(store);

    const response = await fetch(urlProfessionalsData, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: encodedBody,
    });

    cookieShouldBeSet(response);

    const responseBody = await response.json();

    const fileUrl = responseBody.UrlDownload;

    const employeeInfoResponse = await fetch(fileUrl);
    const rawData = await employeeInfoResponse.arrayBuffer();

    const decoder = new TextDecoder("windows-1252");
    const csvFile = decoder.decode(rawData);

    const csvParsed = parse(csvFile, {
      delimiter: ";",
      columns: true,
      relax_column_count: true,
    });

    for (const row of csvParsed) {
      const birthdayDate = row["Data de nascimento"];
      if (
        !birthdayDate &&
        !missingBirthdayList.includes(row["Nome completo"])
      ) {
        missingBirthdayList.push(row["Nome completo"]);
        continue;
      }

      const [birthdayDay, birthdayMonth, _] = birthdayDate.split("/");
      if (
        birthdayMonth === month &&
        !Object.keys(birthdayList).includes(row["Nome completo"])
      ) {
        birthdayList[row["Nome completo"]] = {
          aniversario: `${birthdayDay}/${birthdayMonth}`,
          loja: store,
          funcao: row["Função"],
        };
      }
    }
  }

  return [birthdayList, missingBirthdayList];
}

async function sendBirthdayListToN8n(birthdayList) {
  if (!process.env.N8N_WEBHOOK || process.env.N8N_TOKEN) {
    throw Error("As variáveis de ambiente do N8N não estão configuradas.");
  }
  const n8nUrl = process.env.N8N_WEBHOOK;
  const token = process.env.N8N_TOKEN;

  await fetch(n8nUrl, {
    method: "POST",
    headers: { auth: token },
    body: JSON.stringify(birthdayList),
  });
}

const request = { getBirthdayList, sendBirthdayListToN8n };

export default request;
