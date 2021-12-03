const express = require('express')
const verifytoken=require('../config/verifytoken')
const router = express.Router()

const { checkAttendence,studentLogin,
    updatePassword,updateProfile, getAllSubjects, getMarks } = require('../controller/studentController')

router.post('/login', studentLogin)

//UPLOAD PROFILE
router.post('/updateProfile',verifytoken, updateProfile)

//UPLOAD PASSWORD
router.post('/updatePassword',verifytoken, updatePassword)    

//get information    
router.get('/getMarks',verifytoken, getMarks)

router.get('/getAllSubjects', verifytoken, getAllSubjects)

router.get('/checkAttendence',verifytoken,  checkAttendence)

module.exports = router