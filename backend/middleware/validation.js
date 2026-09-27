const { body, validationResult } = require("express-validator")

const validation = [
    body("username")
        .notEmpty()
        .withMessage("Username is Required")
        .isLength({ min: 4 })
        .withMessage("Username is Too Short")
        .isLength({ max: 20 })
        .withMessage("Username is Too Long"),

    body("password")
        .notEmpty()
        .withMessage("Password is Required")
        .isLength({ min: 4 })
        .withMessage("Password is Too Short"),


]

function requestValidation(req, res, next) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    next()
}


module.exports = {
    validation,
    requestValidation
}