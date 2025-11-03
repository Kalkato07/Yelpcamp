if(process.env.NODE_ENV !== 'production'){
    require('dotenv', {override: true}).config();
}
const maptilerClient = require('@maptiler/client');
const { override } = require('joi');

maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

async function geoSearch() {
    const result = await maptilerClient.geocoding.forward("paris");
    console.log (result.features[0]);
}

geoSearch()