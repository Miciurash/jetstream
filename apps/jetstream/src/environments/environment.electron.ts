export const environment = {
  name: 'Jetstream',
  production: true,
  isElectron: true,
  rollbarClientAccessToken: process.env.NX_ROLLBAR_KEY,
  amplitudeToken: process.env.NX_AMPLITUDE_KEY,
  authAudience: process.env.NX_AUTH_AUDIENCE,
};
