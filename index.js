const express = require('express');
const app = express()
const session = require('express-session')
const userRoutes = require('./routes/userRoutes');
const adminRoute = require('./routes/adminRoutes')
const mongoose = require('mongoose');
require("dotenv").config()

mongoose.connect("mongodb+srv://gokulmr441:Gkul8943@cluster0.fb9m1yj.mongodb.net/AUDIONIX");

mongoose.connection.on('connected', () => {
     console.log('Connected to MongoDB');
});
app.set('view engine', 'ejs')

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

app.use(session({
     secret: process.env.session_secret,
     resave: false,
     saveuninitialized: true
}));


app.use(userRoutes);

app.use('/admin', adminRoute);


app.use((req, res, next) => {
     res.status(404).render("./user/error404", { User: null });
});


app.listen(3000, function () {
     console.log('server is running @ http://localhost:3000')
}); 
