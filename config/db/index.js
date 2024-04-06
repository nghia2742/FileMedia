const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/lab6_7', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

    } catch (error) {
        console.log('Connect to Database failed!!!');
    }
}

module.exports = { connect };
