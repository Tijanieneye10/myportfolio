const express = require('express')
const router = express.Router()
const projectModel = require('../models/projectModel')
const validateProject = require('../validations/projectValidation')
const { validationResult } = require('express-validator')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const upload = require('../middlewares/upload')
const { MulterError } = require('multer')
const { authMiddleware } = require('../middlewares/authMiddleware')

// Admin add project
router.get('/', authMiddleware, (req, res) => {
    res.render('admin/index', {
       errorsMsg: req.session.errorsMsg,
       multerErr: req.session.multerErr,
       message: req.session.success,
       erroCan: req.session.errorsMsg = null,
       erroCancel: req.session.multerErr = null
    })
   
})

router.post('/', authMiddleware, (req, res, next) => {
  upload(req, res, function (err) {
     if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        req.session.multerErr = err.message
        res.redirect('/admin')
     } else if (err) {
        // An unknown error occurred when uploading.
        res.send(err)
     }

     // Everything went fine.
     next()
  })
})

router.post('/', authMiddleware, validateProject, async (req, res) => {

   const filename = req.file != null ? req.file.filename : null
       const { title, projectid, desc, url } = req.body
       const saveProject = new projectModel({
          title,
          projectid,
          desc,
          url,
          image: filename
       })
    try {
       const errors = validationResult(req).throw()
       await saveProject.save()
       req.session.success = 'Projected inserted successfully'
       res.redirect('/admin')
    } catch (err) {
       if(saveProject.image != null){
         unlinkImage(saveProject.image)
       }
       console.log(err)
       req.session.errorsMsg = await err.array()
       res.redirect('/admin')
   }
})

// Let loop out all the projects
router.get('/viewprojects', authMiddleware, async (req, res) => {
   try {
   const projects = await projectModel.find()
   const i = 1
   res.render('admin/viewprojects', { projects, i })
   } catch (e) {
      console.log(e)
   }
   
})

// Let edit project
router.get('/editproject/:id', authMiddleware, async (req, res) => {

   try {
        const editProject = await projectModel.findById(req.params.id)
        res.render('admin/editproject', {
           editProject,
           errorsMsg: req.session.errorsMsg,
           multerErr: req.session.multerErr,
           message: req.session.success,
           erroCancels: req.session.success = null,
           erroCan: req.session.errorsMsg = null,
           erroCancel: req.session.multerErr = null

        })
   } catch (e) {
      console.log(e)
   }

})

// Let delete post
router.post('/delete/:id', authMiddleware, async (req, res) => {
   try {
      const project = await projectModel.findById(req.params.id)  
      unlinkImage(project.image)
      await projectModel.findByIdAndDelete(req.params.id)
      res.redirect('/admin/viewprojects')
   } catch (e) {
      console.log(e)
   }
   
})

// let update the project
router.post('/update/:id', authMiddleware, (req, res, next) => {
   upload(req, res, function (err){
      if (err instanceof multer.MulterError) {
         req.session.multerErr = err.message
         res.redirect('back')
      } else if(err){
         req.session.multerErr = err.message
         res.redirect('back')
      } else {
         next()
      }

   })
})
router.post('/update/:id', authMiddleware, validateProject, async (req, res) => {
     const filename = req.file != null ? req.file.filename : null
     const { title, projectid, desc, url } = req.body
   try {
      validationResult(req).throw()
         if (req.file != null) {
            await projectModel.findByIdAndUpdate(req.params.id, {
               title,
               projectid,
               desc,
               url,
               image: filename
            })
            req.session.success = 'Projected inserted successfully'
         } else {
            const currentImage = await projectModel.findById(req.params.id)
            await projectModel.findByIdAndUpdate(req.params.id, {
               title,
               projectid,
               desc,
               url,
               image: currentImage.image
            })
            req.session.success = 'Projected inserted successfully'
         }
      res.redirect('back')
   } catch(err)
   {
        if (req.file != null) {
           unlinkImage(req.file.filename)
        }
      console.log(err)
      req.session.errorsMsg = await err.array()
      res.redirect('back')

   }
})

// let unlink the image if validation failed
function unlinkImage(image) {
   fs.unlink(path.join('./public/uploads', image), (err)=>{
      if(err) return console.log(err)
   })
}
module.exports = router