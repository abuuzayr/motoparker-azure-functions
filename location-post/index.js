const axios = require('axios') 

// Load the server
const db = require('../server')

// Load the Location Model
const Location = require('../models/location')

module.exports = async function (context, req) {
    const authUrl = `https://${req.headers.host}/.auth/me`
    let message, 
        resCode, 
        authorized = false

    const options = {
        headers: {
            'X-ZUMO-AUTH': req.headers['x-zumo-auth'] ? req.headers['x-zumo-auth'] : ''
        }
    }

    try {
        const response = await axios.get(authUrl, options)
        if (response.status === 200) authorized = true
    } catch (e) {
        resCode = e.response.status
        message = e.response.statusText
    }

    if (authorized) {
        const locations = Array.isArray(req.body) ? req.body : [req.body]
        const existingLocations = locations.filter(location => location.hasOwnProperty('id'))
        const newLocations = locations.filter(location => !location.hasOwnProperty('id'))
        const success = []
        const errored = []

        try {
            // Handle existing locations
            await Promise.all(existingLocations.map(async location => {
                const updatedLocation = await Location.findOneAndUpdate(
                    { _id: location.id },
                    location
                )
                await updatedLocation.save(
                    (err, location) => {
                        if (err) {
                            errored.push({
                                name: location.name,
                                message: err.message
                            })
                        } else {
                            success.push(location.name)
                        }
                    }
                )
            }))

            if (newLocations.length === 0) {
                resCode = 200
                message = JSON.stringify({
                    'success': success.join(', '),
                    'errors': errored.join(', ')
                })
            } else {
                // Bulk create new locations
                await Location.create(
                    newLocations,
                    (err, locations) => {
                        if (err) {
                            newLocations.forEach(location => {
                                errored.push(JSON.stringify({
                                    name: location.name,
                                    message: err.message
                                }))
                            })
                        } else {
                            locations.forEach(location => {
                                success.push(location.name)
                            })
                        }
                    }
                )
                resCode = 201
                message = JSON.stringify({
                    'success': success.join(', '),
                    'errors': errored.join(', ')
                })
            }
        } catch (err) {
            console.log('location-post', err) // output to netlify function log
            resCode = 400,
            message = JSON.stringify({ msg: err.message })
        }
    }

    context.res = {
        status: resCode,
        body: message
    }
};