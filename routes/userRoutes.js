const express = require('express')
const { flash } = require('express-flash-message');
const router = express.Router()
const { check, validationResult } = require('express-validator')
const userValidate = require('../validations/userValidate')
const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const { authMiddleware, userDetails, getUser, loginCntAccess } = require('../middlewares/authMiddleware')
const flashMsg = require('../middlewares/flashMsg')
const sendMail = require('../middlewares/email')
const bcrypt = require('bcrypt')

router.get('/', authMiddleware, flashMsg, async (req, res) => {
    // res.send({message: await req.consumeFlash('error'))
    res.render('admin/register')
})

router.post('/', authMiddleware, userValidate, async (req, res) => {
    try {
    const errors = validationResult(req).throw()
     const user = new userModel(req.body)
        await user.save()
        req.session.flashData = {
            message: {
                type: 'success',
                body: 'User registered successfully'
            }
        }
        res.redirect('/user')
    } catch (err) {
        req.session.flashData = {
            message: {
                type: 'error',
                body: 'Validation Failed'
            },
            alert: await err.mapped()
        }
        res.redirect('/user')
  }
})

router.get('/login', loginCntAccess, async (req, res) => {
    try {
    res.render('admin/login', {
        message: await req.consumeFlash('info')
    })
    } catch (e) {
        console.log(e)
    }
   
})


// jwt function
const maxAge = 3 * 24 * 60 * 60
const createToken = (id) => {
    return jwt.sign({
        id
    }, process.env.TOKEN, {
        expiresIn: maxAge
    })
}

router.post('/login', async (req, res) => {
    try {
       const { email, password } = req.body
       const user = await userModel.checkUser(email, password)
        if (user) {
            const token = createToken(user._id)
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
           return res.redirect('/admin')
       }
    } catch (err) {
         await req.flash('info', 'Invalid Username or Password')
        res.redirect('/user/login')
    }
   
})

// let loopout users
router.get('/viewusers', authMiddleware, async (req, res) => {
    try {
    const users = await userModel.find()
    const i = 1
    res.render('admin/viewusers', { users, i })
    } catch (e) {
        console.log(e)
    }
 
})

// Logout route
router.get('/logout', authMiddleware, (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 })
    res.redirect('/')
})

// let delete user from database
router.post('/delete/:id', authMiddleware, getUser, async (req, res) => {
    await userModel.findByIdAndDelete(req.params.id)
    res.redirect('back')
})

// let edit user
router.get('/forgotpassword', async (req, res) => {
    res.render('admin/forgotpassword', {
        message: await req.consumeFlash('info'),
        error: await req.consumeFlash('error')
    })
})
router.post('/forgotpassword', async (req, res) => {
    try {
    const { email } = req.body
    const emailExists = await userModel.findOne({ email })
    if (emailExists) {
    const randPass = makeid()
    const updatePass = await userModel.findByIdAndUpdate(emailExists._id, { password: await bcrypt.hash(randPass, 8) })
    await sendMail(emailExists.email, emailExists.fullname, randPass)
    await req.flash('info', 'Check your Email')
    res.redirect('back')
    } else {
        await req.flash('error', 'Email not found')
        res.redirect('back')
    }
    } catch (e) {
        res.send(e)
    }
  
})


// function to generate random number
function makeid() {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!%";

    for (let i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

module.exports = router
