// server.js

const mongoose = require('mongoose')

// Suppress all deprecation warnings
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// Set DB from mongoose connection
mongoose.connect(process.env.DB_URL).then(
    () => { console.log('Database connection is successful') },
    err => { console.log('Error when connecting to the database' + err) }
)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

module.exports = db
