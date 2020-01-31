// Load the server
const db = require('../server')

// Load the Location Model
const Location = require('../models/location')

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    try {
        const location = await Location.findById(req.query.id)
        context.res = {
            status: 200,
            body: JSON.stringify({ 'location': location })
        }
    } catch (err) {
        console.log('location-get', err) // output to netlify function log
        context.res = {
            status: 400,
            body: JSON.stringify({ msg: err.message })
        }
    }
};