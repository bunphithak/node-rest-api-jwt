const express = require('express');
const db = require('./app/api/config/database');
const app = express()
const config = require('./app/api/utilities/config');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const errorHandler = require('./app/api/utilities/errorHandler')

const AppError = require('./app/api/utilities/appError');


const limiter = new rateLimit(config.rateLimitConfig);

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'public/views'));

app.use(cors());

app.options('*', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet({
    noCache: true,
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());



// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price'
        ]
    })
);

app.use(compression());

app.use(
    bodyParser.json(),
    bodyParser.urlencoded({
        extended: true,
    })
)

//handleError

// Limit requests from same API
app.use('/api', limiter);

const port = process.env.PORT || config.apiPort;
const server = app.listen(port, async () => {
    await db.connectDatabase()
    setAppRouting()
    console.log(`App running on port ${port}`);
})


function setAppRouting() {
    const routerApi = require('./app/api/routes/index')
    app.use('/api/v1', routerApi)
    app.all('*', (req, res, next) => {
        next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    });
    app.use(errorHandler)
}


process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        console.log('💥 Process terminated!');
    });
});