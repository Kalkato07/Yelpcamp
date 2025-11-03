const CampGround = require('../models/campgrounds');
const mongoose = require('mongoose');
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp-maptiler');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Data base connected")
})

async function seedDB() {
    await CampGround.deleteMany({})
    for(let i = 0; i < 50; i++){
        const randomCity = Math.floor(Math.random()*1000);
        const sample = array => array[Math.floor(Math.random()*array.length)]
        const c = new CampGround({
            location: `${cities[randomCity].city}, ${cities[randomCity].state}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[randomCity].longitude,
                    cities[randomCity].latitude,
                ]
            },
            title: `${sample(descriptors)}, ${sample(places)}`,
            author: '68f470428304126a48cef398',
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui quis voluptatibus earum autem doloremque excepturi ducimus veniam, velit officiis ipsam nobis, ut fugiat possimus adipisci explicabo, itaque facere obcaecati aperiam?",
            images : [{
                url: 'https://res.cloudinary.com/dcjcdbrj2/image/upload/v1759592989/YelpCamp/k9qdzg5hza6fqyjhv1yf.jpg',
                filename: 'YelpCamp/k9qdzg5hza6fqyjhv1yf'
            },
            {
              url: 'https://res.cloudinary.com/dcjcdbrj2/image/upload/v1759592989/YelpCamp/k9qdzg5hza6fqyjhv1yf.jpg',
                filename: 'YelpCamp/k9qdzg5hza6fqyjhv1yf'   
            }
        ]
         })        
          await c.save() 
    }
}

seedDB()
.then(() => {
    db.close()
})