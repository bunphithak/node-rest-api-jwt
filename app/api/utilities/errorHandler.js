module.exports = function errorHandler(err, req, res, next) {
    if (err) {
        console.log("Error -> ", err.message, '====>', err)
        let message,
            status = 400
        switch (err.code) {
            case 11000:
                message = "มีอีเมลนี้ในระบบแล้ว"
                break;
            default:
                message = err.message
                break;
        }
        res.status(400).json({ status_code: status, message })
    }
}
