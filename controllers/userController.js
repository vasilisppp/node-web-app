const User = require('../models/User')
const Post = require('../models/Post')

exports.mustBeLoggedIn = function (req, res, next) {
  if (req.session.user) {
    next()
  } else {
    req.flash('errors', 'You must be logged in to perform that action')
    req.session.save(function () {
      res.redirect('/')
    })
  }
}

exports.login = function (req, res) {
  let user = new User(req.body)
  user
    .login()
    .then(function (result) {
      req.session.user = {
        username: user.data.username,
        _id: user.data._id,
        avatar: user.avatar,
      }
      req.session.save(() => res.redirect('/'))
    })
    .catch(function (e) {
      req.flash('errors', e)
      req.session.save(() => res.redirect('/'))
    })
}

exports.logout = function (req, res) {
  req.session.destroy(() => {
    res.redirect('/')
  })
}

exports.register = async function (req, res) {
  let user = new User(req.body)
  user
    .register()
    .then(() => {
      req.session.user = {
        username: user.data.username,
        _id: user.data._id,
        avatar: user.avatar,
      }
      req.session.save(() => res.redirect('/'))
    })
    .catch((regErrors) => {
      regErrors.forEach((error) => {
        req.flash('regErrors', error)
      })
      req.session.save(() => res.redirect('/'))
    })
}

exports.home = function (req, res) {
  if (req.session.user) {
    res.render('home-dashboard')
  } else {
    res.render('home-guest', {
      regErrors: req.flash('regErrors'),
    })
  }
}

exports.ifUserExists = function (req, res, next) {
  User.findByUsername(req.params.username)
    .then(function (userDocument) {
      req.profileUser = userDocument
      next()
    })
    .catch(function (e) {
      console.log(e)
      res.render('404')
    })
}

exports.profilePostsScreen = function (req, res) {
  // Get posts from post model
  Post.findByAuthorId(req.profileUser._id)
    .then(function (posts) {
      res.render('profile', {
        posts: posts,
        profileUsername: req.profileUser.username,
        profileAvatar: req.profileUser.avatar,
      })
    })
    .catch(function () {
      res.render('404')
    })
}
