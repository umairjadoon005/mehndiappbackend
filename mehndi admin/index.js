 // index.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const expressLayouts = require('express-ejs-layouts');
const app = express();
const port = 8080;
const mongoose = require('mongoose');
const Category = require('./models/category');
const images = require('./models/images');
const category = require('./models/category');
// Dummy admin credentials
const ADMIN_USER = {
  username: 'admin',
  password: 'admin123',
};
app.use(expressLayouts);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.set('layout','partials/header');
// Set up session
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true
}));
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mydb')
  .then(async () => {
    console.log('✅ Mongo connected!');
  })
  .catch(err => console.error(err));

// Middleware to protect admin route
function isAuthenticated(req, res, next) {
  if (req.session && req.session.loggedIn) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// GET: Login form
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// POST: Handle login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    req.session.loggedIn = true;
    res.redirect('/admin');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

// GET: Admin dashboard 
// 





















 
app.get('/admin', isAuthenticated, async(req, res) => { 

var categories= await Category.find();
console.log(categories);
  res.render('categories',{categories});
  //  res.render('dashboard', { title: 'Admin Dashboard' });
});

app.get('/categories/new',isAuthenticated,(req,res)=>{
  res.render('addCategory');

});

app.get('/design', isAuthenticated, async(req, res) =>{
  var design= await images.find();
  console.log(design); 
  res.render('design', {design});
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.get('/design/new', isAuthenticated, async (req, res) =>{
    var categories= await Category.find();
    res.render('uploadimage',{categories} );
});




app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { category } = req.body;
    await images.create({
      filename: req.file.filename,
      category
    });
    res.redirect('/design/new');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error uploading image');
  }
});




// testr
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;
    await Category.create({ name });
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding category');
  }
});


//api endpoints

// GET all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories); // returns array of categories
  } catch (err) {
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

// GET images by category ID
app.get('/api/images/category/:id', async (req, res) => {
  try {
    const image = await images.find({ category: req.params.id }).populate('category');
    res.json(image);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error fetching images for category' });
  }
});




// Start server
app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
