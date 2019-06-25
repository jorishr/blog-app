const   path                    = require('path'),
        express                 = require('express'),
        app                     = express(),
        port                    = 3000,
        bodyParser              = require('body-parser'),
        sanitizer               = require('express-sanitizer'),
        mongoose                = require('mongoose'),
        db                      = mongoose.connection,
        methodOverride          = require('method-override'),
        passport                = require('passport'),
        User                    = require('./models/user'),
        LocalStrategy           = require('passport-local').Strategy,
        passportLocalMongoose   = require('passport-local-mongoose'),
        expressSession          = require('express-session');
        
//  BASIC EXPRESS/MONGO CONFIG*/

mongoose.connect('mongodb://localhost/blog-app', {useNewUrlParser: true});
db.on('error', console.error.bind(console, 'connection error:'));

app.listen(port, () => console.log(`Express Server is listening on port ${port}`));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method')); //  for put/delete requests
app.use(sanitizer());   //  after bodyParser

app.use(expressSession({
    secret: 'This is a secret encoding',
    resave: false,
    saveUninitialized: false
}));

passport.use(new LocalStrategy(User.authenticate()));   //  method provided by passport-local-mongoose

app.use(passport.initialize()); 
app.use(passport.session());

passport.serializeUser(User.serializeUser());   //  reading session data, encode
passport.deserializeUser(User.deserializeUser());   //  decode

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// SCHEMA AND MODEL

let blogSchema = new mongoose.Schema({
    title: String,
    created: {type: Date, default: Date.now},
    body: String
});
let BlogPost = mongoose.model('blogpost', blogSchema);

//  ROUTES

app.get('/', (req, res) => {
    res.render('home');
});

//  INDEX ROUTE

app.get('/blog', (req, res) => {
    BlogPost.find({}, (err, allBlogPosts) => {
        if(err){console.log('error', err)}
            else {
                res.render('blog', {postData: allBlogPosts});
                console.log('Found the following posts:\n', allBlogPosts);
            };
    });

});

//  NEW ROUTE

app.get('/blog/new', (req, res) => {
    res.render('new-post');
});

//  CREATE ROUTE

app.post('/blog', (req, res) => {
/* 
    let newPostTitle = req.body.blogPost.title;
    let newPostBody = req.body.blogPost.body;
    let newPost = {title: newPostTitle, body: newPostBody};  
    NOTE: all form name attribute have been put into a single object: 
    blogPost[property]. This automates the process of new data creation. 
    
    Avoid malicous code entry: express-sanitizer.
    Select the body property on the blogPost object
*/  
    req.body.blogPost.body = req.sanitize(req.body.blogPost.body);
    BlogPost.create(req.body.blogPost, (err, savedData) => {
        if(err){console.log('error', err)}
            else {
                console.log('New Blog Post: Success', savedData);
                res.redirect('/blog'); 
            }
    });
});

// SHOW ROUTE

app.get('/blog/:id', (req, res) => {
    BlogPost.findById(req.params.id, (err, foundData) => {
        if(err){console.log('Error:', err)}
            else{
                res.render('post', {postData: foundData})
            }
    });
});

//  EDIT ROUTE

app.get('/blog/:id/edit', (req, res) => {
    BlogPost.findById(req.params.id, (err, foundData) => {
        if(err){console.log('error', err); res.redirect('/blog');}
            else {
                console.log('Updated Blog Post: Success', foundData);
                res.render('edit', {postData: foundData}); 
            }
    });
})

//  UPDATE ROUTE

app.put('/blog/:id', (req, res) => {
    req.body.blogPost.body = req.sanitize(req.body.blogPost.body);
    BlogPost.findByIdAndUpdate(req.params.id, req.body.blogPost, (err, updatedData) => {
        if(err){console.log('error', err)}
            else {
                console.log('Updated Blog Post: Success', updatedData);
                res.redirect(`/blog/${req.params.id}`);
                    //  takes you back to the updated post, 
                    //  access the id through req.params 
            }
    });
});

//  DESTROY ROUTE

app.delete('/blog/:id', (req, res) => {
    BlogPost.findByIdAndRemove(req.params.id, (err) => {
        if(err){console.log('error', err)}
            else {
                console.log('Delete Blog Post: Success');
                res.redirect('/blog');
            }
    });
});

//  SECRET ROUTE
app.get('/secret', isLoggedIn, (req, res) => {
    res.render('secret');
});   

//  ==============
//  AUTH ROUTES

//  register

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', function(req, res, next) {
    console.log('registering user');
    User.register(new User({username: req.body.username}), req.body.password, function(err) {
        if (err) {
            console.log('error while user register!', err);
            return next(err);
        }
        console.log('user registered!');
        res.redirect('/');
    });
});

//  login/logout

app.get('/login', (req, res) =>{
    res.render('login');
});

app.post('/login', passport.authenticate('local'), (req, res, next) => {
    console.log('user login success');
    res.redirect('/secret');
});

app.get('/logout', function(req, res) {
    req.logout();
    console.log('logout success');
    res.redirect('/');
});

function isLoggedIn (req, res, next){
    if(req.isAuthenticated()){
        return next();
    };
    res.redirect('/');
};