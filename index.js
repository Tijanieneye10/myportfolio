require('dotenv').config()
const express = require('express')
const session = require("express-session");
const { flash } = require('express-flash-message');
const app = express()
require('./models/db')
const adminRoute = require('./routes/adminRoutes')
const userRoute = require('./routes/userRoutes')
const cookieParser = require('cookie-parser')
const { authMiddleware, userDetails, getUser } = require('./middlewares/authMiddleware')
const projectModel = require('./models/projectModel')
const contactMail = require('./middlewares/contactMail')
const MongoDBStore = require('connect-mongodb-session')(session)
const port = process.env.PORT || 5000


var store = new MongoDBStore({
    uri: process.env.DB_HOST,
    collection: 'mySessions'
});

store.on('error', function (error) {
    console.log(error);
});

// Middlewares
// Let set session here
const sess = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {},
    store,
};

if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy
    sess.cookie.secure = true; // serve secure cookies
}

// Adding a middleware to force users to https://
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        if (req.headers['x-forwarded-proto'] !== 'https')
            // the statement for performing our redirection
            return res.redirect('https://' + req.headers.host + req.url);
        else
            return next();
    } else
        return next();
});
app.use(session(sess));
app.use(flash({ sessionKeyName: 'flashMessage' }))
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())





// Local Global variables
app.locals.message = {}
app.locals.errors = {}
app.locals.multerErr = {}
app.locals.alert = {}
app.locals.errorsMsg = {}

// middleware to will be application to all get routes
app.get('*', userDetails)
app.get('*', getUser)

// Router Middleware
app.use('/admin', adminRoute)
app.use('/user', userRoute)

app.get('/', async (req, res) => {
    try {
    const projects = await projectModel.find()
    res.render('index', { projects })
    } catch (e) {
        console.log(e)
    }
 
})

// Let send sms 
app.post('/sms', async (req, res) => {
    try {
    const { email, name, subject, desc } = req.body
    await contactMail(email, name, subject, desc)
    res.redirect('back')  
    } catch (e) {
        console.log(e)
    }
   
})




app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})