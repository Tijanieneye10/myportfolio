const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')

const authMiddleware = (req, res, next) => {
    const token = req.cookies.jwt
    // let check if it exists and verify
    if (token) {
        jwt.verify(token, process.env.TOKEN, (err, decodedToken) => {
            if (err) {
                res.redirect('/user/login')
            } else {
                next()
            }
        })
    }
    else {
        res.redirect('/user/login')
    }
}

const userDetails =  (req, res, next) => {
    
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, process.env.TOKEN, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null
                console.log(err.message)
                next()
            } else {
                const user = await userModel.findById(decodedToken.id)
                // console.log(user)
                res.locals.user = user
                next()
            }
        })
    } else {
        res.locals.user = null
        next()
    }
}

const getUser = (req, res, next) => {
       const token = req.cookies.jwt
       if (token) {
           jwt.verify(token, process.env.TOKEN, async (err, decodedToken) => {
               if (err) {
                //    res.locals.user = null
                   console.log(err.message)
                   next()
               } else {
                   const user = await userModel.findById(decodedToken.id)
                //    console.log(user)
                   req.user = user
                   next()
               }
           })
       } else {
           next()
       }
}

const loginCntAccess = (req, res, next) => {
    const token = req.cookies.jwt
      if (token) {
          jwt.verify(token, process.env.TOKEN, async (err, decodedToken) => {
              if (err) {
                  //    res.locals.user = null
                  console.log(err.message)
                  next()
              } else {
                res.redirect('/admin')
              }
          })
      } else {
          next()
      }
}

module.exports = {
    authMiddleware,
    userDetails,
    getUser,
    loginCntAccess
}

