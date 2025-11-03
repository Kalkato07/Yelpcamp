const express = require('express');
const router = express.Router({mergeParams: true});
const Review = require('../models/review.js');
const catchAsync = require('../utils/catchAsync');
const CampGround = require('../models/campgrounds');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js');
const reviews = require('../controllers/reviews.js');

router.post('/',isLoggedIn, validateReview, catchAsync(reviews.CreateReview));

router.delete('/:reviewId',isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;