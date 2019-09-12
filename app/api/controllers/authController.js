const catchAsync = require('../utilities/catchAsync');
module.exports = {
    signup: catchAsync(async (req, res, next) => {
       res.status(200).jsonp({message: "singup function !!"})
    }) 
}