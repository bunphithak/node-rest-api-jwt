const express = require('express');
const db = require('./app/api/config/database');
const app = express()
const config = require('./app/api/utilities/config');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');


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
    app.use('api/v1/', routerApi)
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