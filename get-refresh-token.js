const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URL = 'YOUR_REDIRECT_URL';

const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar']
});

console.log('Authorize this app by visiting this url:', url);

// Após obter o código de autorização, execute este script novamente com o código para obter o refresh token:
oauth2Client.getToken('YOUR_AUTH_CODE', (err, tokens) => {
  if (err) return console.error('Error retrieving access token', err);
  console.log('Refresh token:', tokens.refresh_token);
});
