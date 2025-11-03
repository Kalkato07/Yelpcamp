const ExpressError = require('./utils/ExpressError');
const CampGround = require('./models/campgrounds.js');
const {reviewSchema, campgroundSchema} = require('./schemas.js');
const Review = require('./models/review.js');

module.exports.isLoggedIn = (req ,res ,next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'User must be logged in');
       return res.redirect('/campgrounds/user/login');
    }
    next();
}

module.exports.isAuthor = async(req, res, next) => {
    const {id} = req.params;
    const campground = await CampGround.findById(id);
    if(!campground.author._id.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async(req, res, next) => {
    const {reviewId, id} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author._id.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
       const {error} = campgroundSchema.validate(req.body) 
    
        if(error) {
            const msj = error.details.map(el => el.message).join(',');
            throw new ExpressError(500, msj);
        }
        else{
            next()
        }
}

module.exports.validateReview = (req, res, next) =>{
    const {error} = reviewSchema.validate(req.body) 

    if(error) {
        const msj = error.details.map(el => el.message).join(',');
        throw new ExpressError(500, msj);
    }
    else{
        next()
    }
}