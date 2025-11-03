const CampGround = require('../models/campgrounds');
const Review = require('../models/review.js');

module.exports.CreateReview = async(req, res) => {
    const campground = await CampGround.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async(req, res) => {
    const {id, reviewId} = req.params;
    await CampGround.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
};