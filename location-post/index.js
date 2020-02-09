// Load the server
const db = require('../server')

// Load the Location Model
const Location = require('../models/location')

module.exports = async function (context, req) {
    // check for auth cookie
    if (req.headers && req.headers.cookie && req.headers.cookie.includes('AppServiceAuthSession=')) {
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
                context.res = {
                    status: 200,
                    body: JSON.stringify({
                        'success': success.join(', '),
                        'errors': errored.join(', ')
                    })
                }
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
                context.res = {
                    status: 201,
                    body: JSON.stringify({
                        'success': success.join(', '),
                        'errors': errored.join(', ')
                    })
                }
            }
        } catch (err) {
            console.log('location-post', err) // output to netlify function log
            context.log({
                status: 400,
                body: JSON.stringify({ msg: err.message })
            })
        }
    } else {
        context.res = {
            status: 401,
            body: "Not authorized"
        }
    }
};