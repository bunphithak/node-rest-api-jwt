
const mongoose = require('mongoose');
const validator = require('validator');
const isJS = require('is_js');
const pbkdf2 = require('pbkdf2');

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
            validator: (el) => el === this.password
        },
        message: 'Passwords are not the same!'
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

userSchema.pre('save', async (next) => {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    const hashPassword = await pbkdf2.pbkdf2Sync(this.password, 'dasdasdasdasdasdasd', 1, 32, 'sha512');
    this.password = hashPassword.toString('hex');

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
})

userSchema.pre('save', (next) => {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, (next) => {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async (
    candidatePassword,
    userPassword
) => {
    let hashPassword = pbkdf2.pbkdf2Sync(userPassword, 'dasdasdasdasdasdasd', 1, 32, 'sha512');
    hashPassword = hashPassword.toString('hex');
    return isJS.equal(hashPassword, hash);
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