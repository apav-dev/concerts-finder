import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import qs from 'qs';

const port = 5000;

global.access_token = '';
global.refresh_token = '';

dotenv.config({ path: '../.env' });

const spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;

const spotify_redirect_uri = 'http://localhost:3000/auth/callback';
const spotify_base_url = 'https://api.spotify.com/v1/';

const app = express();
app.use(express.json());

const generateRandomString = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const getRefreshToken = () => {
  const form = {
    grant_type: 'refresh_token',
    refresh_token: refresh_token,
  };

  axios
    .post('https://accounts.spotify.com/api/token', qs.stringify(form), {
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64'),
      },
    })
    .then((response) => {
      access_token = response.data.access_token;
      setTimeout(getRefreshToken, 3600000);
    });
};

app.get('/auth/login', (req, res) => {
  const scope = 'streaming \
               user-read-email \
               user-read-private';
  const state = generateRandomString(16);

  const auth_query_params = new URLSearchParams({
    response_type: 'code',
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state,
  });

  res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_params.toString());
});

app.get('/auth/callback', (req, res) => {
  const code = req.query.code;

  const form = {
    code: code,
    redirect_uri: spotify_redirect_uri,
    grant_type: 'authorization_code',
  };

  axios
    .post('https://accounts.spotify.com/api/token', qs.stringify(form), {
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64'),
      },
    })
    .then((response) => {
      access_token = response.data.access_token;
      setTimeout(getRefreshToken, 3600000);

      refresh_token = response.data.refresh_token;
      res.redirect('/');
    });
});

app.get('/auth/token', (req, res) => {
  res.json({ access_token: access_token });
});

// app.get('/artists/:artistId/*', (req, res) => {
//   console.log('artist id: ' + req.params.artistId);
// });

// app.put('/me/player/play*', (req, res) => {
//   const deviceId = req.params.device_id;
//   const trackUri = req.body.uris[0];

//   const playOptions
// });

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

export default app;
