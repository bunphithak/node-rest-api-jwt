require('dotenv').config();
var env_type = {
    PRODUCTION: 'PRODUCTION',
    LOCALHOST: 'LOCALHOST',
    REMOTE_DEV: 'R_DEVELOP',
};
module.exports = {
    env: (process.env.env_type || env_type.REMOTE_DEV).trim(),
    apiPort: 3000,
    secretKey: 'NODE|JS|JWT!@#$%ASD##',
    tokenSessionTimeout: 48 * 60 * 60,

    databasePath: () => {
        let path = '';
        switch (module.exports.env) {
            case env_type.LOCALHOST:
                path = 'mongodb://localhost:27017/node-rest-api-jwt';
                break;
        }
        return path
    },

    rateLimitConfig: {
        max: 100,
        windowMs: 60 * 60 * 1000,
        message: 'Too many requests from this IP, please try again in an hour!'
    }
}