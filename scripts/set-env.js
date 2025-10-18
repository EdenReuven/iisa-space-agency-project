const replace = require('replace-in-file');
const fs = './src/environments/environment.prod.ts';

const options = {
  files: fs,
  from: /googleMapsApiKey: ''/,
  to: `googleMapsApiKey: '${process.env.GOOGLE_MAPS_API_KEY}'`,
};

replace(options)
  .then(() => {
    console.log('API key injected successfully!');
  })
  .catch(error => {
    console.error('Error injecting API key:', error);
  });
