const mongoose = require('mongoose')

mongoose.connect(process.env.DB_HOST, {
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useNewUrlParser: true
})

mongoose.connection.once('open', () => console.log('DB is working'))