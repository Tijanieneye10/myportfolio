const { check } = require('express-validator')
const userModel = require('../models/userModel')

const userValidate = [
    check('fullname')
    .exists({
        checkFalsy: true
    }).withMessage('Fullname is required')
        .bail()
        .trim(),
    check('email')
    .exists({
        checkFalsy: true
    }).withMessage('Email is required')
        .isEmail()
        .custom(async (email) => {
            const existingEmail = await userModel.findOne({ email })
           if(existingEmail)
           {
               throw new Error('Email Already used')
           } 
        })
        .bail()
        .trim()
        .normalizeEmail(),
    check('password').exists({ checkFalsy: true }).withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password length cant be less than six')
        .bail()
        .trim()
        
      
]

module.exports = userValidate