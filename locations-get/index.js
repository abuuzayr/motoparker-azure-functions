// Load the server
const db = require('../server')

// Load the Location Model
const Location = require('../models/location')

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    try {
        const locations = await Location.find({ active: true })
        context.res = {
            status: 200,
            body: JSON.stringify({ 'locations': locations })
        }
    } catch (err) {
        console.log('locations-get', err) // output to netlify function log
        context.res = {
            status: 400,
            body: JSON.stringify({ msg: err.message })
        }
    }
};