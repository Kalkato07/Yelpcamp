if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}



const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
const express = require('express');
const app = express();
app.set('query parser', 'extended');
const path = require('path');
const mongoose = require('mongoose');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const campRouter = require('./routes/campgrounds.js');
const reviewRouter = require('./routes/reviews.js');
const userRouter = require('./routes/user.js');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl)

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Data base connected")
})

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(methodOverride('_method'))
app.use(express.urlencoded({extended: true}))

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on('error', (e) => {
    console.log('Session STORE ERROR', e);
});

const sessionConfig = {
    store,
    name: 'sessionjose',
    secret: 'thisshoulbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    
    cookie: {
        httpOnly: true,
        /* secure: true, */
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];

const connectSrcUrls = [
    "https://api.maptiler.com/"
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dcjcdbrj2/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campRouter);
app.use('/campgrounds/:id/reviews', reviewRouter);
app.use('/', userRouter);

app.get('/home', (req, res) => {
    res.render('home')
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(sanitizeV5({ replaceWith: '_' }));

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page not found"))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('Error', { err })
})


app.listen(3000, (req,res) => {
    console.log('Activo en el puerto 3000');
})