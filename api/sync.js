const puppeteer = require('puppeteer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function getCertificados() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://08978175000180.portal-veri.com.br/certificado_a1/listar');

  const certificados = await page.evaluate(() => {
    const rows = document.querySelectorAll('#example tbody tr');
    return Array.from(rows).map(row => {
      const nome = row.querySelector('td:nth-child(2)').innerText;
      const data_vencimento = row.querySelector('td:nth-child(3) span').innerText;
      return { nome, data_vencimento };
    });
  });

  await browser.close();
  return certificados;
}

async function createCalendarEvent(auth, certificado) {
  const calendar = google.calendar({ version: 'v3', auth });
  const event = {
    summary: `Vencimento do Certificado: ${certificado.nome}`,
    start: { date: certificado.data_vencimento },
    end: { date: certificado.data_vencimento },
  };
  try {
    await calendar.events.insert({ calendarId: 'primary', resource: event });
    console.log(`Evento criado para o certificado: ${certificado.nome}`);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
  }
}

module.exports = async (req, res) => {
  const certificados = await getCertificados();
  for (const certificado of certificados) {
    await createCalendarEvent(oauth2Client, certificado);
  }
  res.send('Eventos criados com sucesso!');
};
