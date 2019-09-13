
const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('../utilities/utils')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        require: [true, "Please provide your email !"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid your email!"]
    },
    photo: {
        type: String,
        default: "default.png"
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        require: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        require: [true, "Please confirm your password"],
        validate: {
            // This only works on CREATE and SAVE!!!
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!'
        }
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

userSchema.pre('save', async function (next){
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await crypto.crypto.cryptoSync(this.password)

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
})

userSchema.pre('save', function (next){
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async (
    candidatePassword,
    userPassword
) => {
    return crypto.crypto.compareSync(candidatePassword, userPassword)
};


userSchema.methods.changedPasswordAfter = (JWTTimestamp) => {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;