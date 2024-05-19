//pass aXsgMpaH8pQIzjDv username  nesturalimited
const mongoose = require('mongoose');
const connectDB = async () =>{
    try {
        const conn = await mongoose.connect('mongodb+srv://nesturalimited:aXsgMpaH8pQIzjDv@udemytest.rrod2qj.mongodb.net/testudemy?retryWrites=true&w=majority')
        console.log(`Mongodb connected ${conn.connection.host}`);

    } catch (error) {

        console.error(`Error connecting to MongoDB ${error.message}`);
        process.exit(1);

}
};

module.exports = connectDB;

