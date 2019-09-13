const catchAsync = require('../utilities/catchAsync');
const User = require('../models/userModel');
const Utils = require('../utilities/utils');
const AppError = require('../utilities/appError');

const createSendToken = (user, statusCode, req, res) => {
    const token = Utils.jwtSign(user)

    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

module.exports = {
    signup: catchAsync(async (req, res, next) => {
        try {
            const newUser = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                passwordConfirm: req.body.passwordConfirm
            })
            // สร้าง token
            createSendToken(newUser, 201, req, res);
        } catch (error) {
            return next(error)
        }
    }),

    login: catchAsync(async (req, res, next) => {
        const { email, password } = req.body

        //1) ตรวจสอบว่ามีอีเมลและรหัสผ่านอยู่หรือไม่
        if (!email || !password) {
            return next(new AppError('โปรดระบุอีเมลและรหัสผ่าน!', 400))
        }

        //2)ตรวจสอบว่ามีผู้ใช้ & & รหัสผ่านที่ถูกต้อง
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new AppError('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401))
        }

        createSendToken(user, 200, req, res);

    })


}