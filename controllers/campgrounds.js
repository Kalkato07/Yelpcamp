const CampGround = require('../models/campgrounds');
const {cloudinary} = require('../cloudinary/index');
const maptilerClient = require('@maptiler/client');
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req,res) => {
    const campgrounds = await CampGround.find({});
    res.render('campgrounds/index', {campgrounds});
};

module.exports.newCampgroundForm = async(req,res) => {
    const {id} = req.params;
    const camp = await CampGround.findById(id);
    res.render('campgrounds/new');
};

module.exports.newCampground = async (req,res) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect('/campgrounds/new');
    }
    console.log(geoData)
    const newCamp =await new CampGround(req.body.campground);
    newCamp.author = req.user._id;
    newCamp.geometry = geoData.features[0].geometry;
    newCamp.location = geoData.features[0].place_name;
    newCamp.images = req.files.map(f => ({url:f.path, filename: f.filename}));
    await newCamp.save();
    req.flash('success', 'campground created successfully');
    res.redirect('/campgrounds');
};

module.exports.showCampgrounds = async (req, res) => {
    const {id} = req.params
    const camp = await CampGround.findById(id).populate({
        path:'reviews',
        populate: {
            path:'author'
        }
    }).populate('author');
    if (!camp) {
        req.flash('error', 'Cannot find that campground');
        res.redirect('/campgrounds');
    }
    else{
        res.render('campgrounds/show', {camp})
    }
    
};

module.exports.editCampgroundForm = async(req, res, next) => {
        const{id} = req.params;
        const camp = await CampGround.findById(id);
        res.render('campgrounds/edit', {camp})
};

module.exports.editCampground = async(req, res, next) => {
     const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect(`/campgrounds/${id}/edit`);
    }

    const {id} = req.params

    const editedCamp = await CampGround.findOneAndUpdate({_id:id}, req.body);

    editedCamp.geometry = geoData.features[0].geometry;
    editedCamp.location = geoData.features[0].place_name;
    const img = req.files.map(f => ({url: f.path, filename: f.filename}))
    editedCamp.images.push(...img);

    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
           await cloudinary.uploader.destroy(filename)
        }
       await editedCamp.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    editedCamp.save()
    req.flash('success', 'campground edited successfully');
    res.redirect('/campgrounds')
};

module.exports.deleteCampground = async(req, res, next) => {
    const{id} = req.params;
    const deleteCamp = await CampGround.findByIdAndDelete(id)
    req.flash('success', 'campground deleted successfully');
    res.redirect('/campgrounds')
};