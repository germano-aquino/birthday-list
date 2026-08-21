const cookie = process.env.COOKIE;

const idEstabelecimentoPattern = new RegExp(
  "(?<=idEstabelecimentoPadrao)(.+?)=(.+?)(?=;)",
);

const match = cookie.match(idEstabelecimentoPattern);

if (!cookie || match.length < 3) {
  throw new Error(
    "Cookie inválido, revise as variáveis de ambiente e tente novamente.",
  );
}

const idContaLogado = match[1];
const idEstabelecimento = match[2];

const headers = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0",
  Accept: "*/*",
  "Content-Type": "application/json",
  "id-conta-logado": idContaLogado,
  "id-estabelecimento-autenticado": idEstabelecimento,
  "X-Requested-With": "XMLHttpRequest",
  Origin: "https://www.trinks.com",
  Cookie: cookie,
};

export default headers;
