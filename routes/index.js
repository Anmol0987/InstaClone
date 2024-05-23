var express = require('express');
var router = express.Router();
const User = require('../routes/users');
const passport = require('passport');
var LocalStrategy = require('passport-local');
const users = require('../routes/users');
const posts = require('../routes/posts');
passport.use(new LocalStrategy(User.authenticate()))
const uploads = require('./multer');
// const upload = require('./multer');


router.get('/', function (req, res) {
  res.render('index', { footer: false });
});

router.get('/login', function (req, res) {
  res.render('login', { footer: false });
});
router.get('/like/:postid',isLoggedIn,async function (req, res) {
  const user = await users.findOne({ username: req.session.passport.user })
  const post = await posts.findOne({ _id: req.params.postid }) 
  if(post.likes.indexOf(user._id) == -1){
    post.likes.push(user._id)
    // console.log('done')
  }
  else{
    post.likes.splice(post.likes.indexOf(user._id),1)
    // console.log('undone')
  } 
  await post.save()
  res.json(post)
});

router.get('/feed', isLoggedIn,async function (req, res) {
  const user = await users.findOne({ username: req.session.passport.user })
  const post = await posts
  .find().populate('user')
  res.render('feed', { footer: true,post,user });
});

router.get('/profile', isLoggedIn, async function (req, res) {
  var user = await users
  .findOne({ username: req.session.passport.user})
  .populate('posts');
  res.render('profile', { footer: true,user});
});
router.post('/uploads/profile', isLoggedIn, uploads.single("profileImage"), async function (req, res) {
  var user = await users.findOne({ username: req.session.passport.user })
  user.profilepic = req.file.filename
  await user.save()
  res.redirect('/profile')
});

router.get('/search', isLoggedIn, function (req, res) {
  res.render('search', { footer: true });
});

router.get('/edit', isLoggedIn, async function (req, res) {
  var user = await users.findOne({ username: req.session.passport.user })
  res.render('edit', { footer: true, user });
});
router.get('/user/:username', isLoggedIn, async function (req, res) {
 var val=req.params.username
//  console.log(val) 
  var inpUser = await users.find({ username: new RegExp("^" + val, "i")})
  // console.log(inpUser)
  res.json(inpUser)
});

router.post('/updated', isLoggedIn, async function (req, res) {
  var user = await users.findOneAndUpdate(
    { username: req.session.passport.user },
    { username: req.body.username, name: req.body.name, bio: req.body.bio },
    { new: true }
  )
  req.logIn(user, function (err) {
    if (err) throw err;
    res.redirect('/profile');
  });
});
router.get('/upload', isLoggedIn, function (req, res) {
  res.render('upload', { footer: true });        
});
router.post('/upload',isLoggedIn,uploads.single("image"),async function (req, res) {
  var user = await users.findOne({ username: req.session.passport.user })
  console.log(user)
  var post =await  posts.create({
    caption: req.body.caption,
    image: req.file.filename,
    user: user._id        
  })
  user.posts.push(post._id)   
  await user.save()     
  res.redirect("/profile");
});


router.post('/register', function (req, res, next) {
  var newUser = new User({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
  })
  User.register(newUser, req.body.password)
    .then(function (u) {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/feed');
      })
    })
    .catch(function (err) {
      res.send(err);
    });

});

// router.post('/login', passport.authenticate('local', {
//   successRedirect: '/feed',
//   failureRedirect: '/'
// }), function (req, res, next) {
// });

router.post('/login', passport.authenticate("local", {
  successRedirect: "/feed",
  failureRedirect: "/login"
}), function (req, res, next) {
});

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  else {
    res.redirect("/")
  }
}

module.exports = router;
