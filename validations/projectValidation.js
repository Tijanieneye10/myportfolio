const { check } = require('express-validator')

const validateProject = [
    check('title')
        .exists({checkFalsy: true}).withMessage('Title is required'),
    check('projectid')
        .exists({
            checkFalsy: true
        }).withMessage('ProjectId is required'),
    check('desc')
        .exists({ checkFalsy: true }).withMessage('Description is required'),
     check('url')
        .exists({checkFalsy: true}).withMessage('Project URL is required is required')
        .trim()
        .isURL().withMessage('Project URL must be in url format')
]

module.exports = validateProject