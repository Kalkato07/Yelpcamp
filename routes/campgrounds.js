const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {validateCampground} = require('../middleware.js');
const {isLoggedIn, isAuthor} = require('../middleware');
const campgrounds = require('../controllers/campgrounds.js');
const multer  = require('multer')
const {storage} = require('../cloudinary');
const upload = multer({storage});

router.route('/')
.get(catchAsync(campgrounds.index))
.post(upload.array('image'), validateCampground, isLoggedIn, catchAsync(campgrounds.newCampground))


router.get('/new', isLoggedIn, catchAsync(campgrounds.newCampgroundForm));

router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(campgrounds.editCampgroundForm));

router.route('/:id')
.patch(upload.array('image'), validateCampground,isAuthor, catchAsync(campgrounds.editCampground))
.delete(isLoggedIn,isAuthor, catchAsync(campgrounds.deleteCampground))
.get(catchAsync(campgrounds.showCampgrounds))

module.exports = router;