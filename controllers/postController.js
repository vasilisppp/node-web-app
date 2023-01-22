const Post = require('../models/Post')

exports.viewCreateScreen = function (req, res) {
  res.render('create-post')
}

exports.create = function (req, res) {
  let post = new Post(req.body, req.session.user._id)
  post
    .create()
    .then(function (postId) {
      req.flash('success', 'New post created')
      req.session.save(() => {
        res.redirect(`/post/${postId}`)
      })
    })
    .catch(function (errors) {
      errors.forEach(e=>{
        req.flash('errors',e)
      })
      req.session.save(()=>{
        res.redirect('/create-post')
      })
    })
}

exports.viewSingle = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId)
    res.render('single-post-screen', { post: post })
  } catch {
    res.render('404')
  }
}

exports.viewEditScreen = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id)
    if (post.authorId == req.visitorId) {
      res.render('edit-post', { post: post })
    } else {
      req.flash('errors', 'You do not have permission to perform that action')
      req.session.save(() => {
        res.redirect('/')
      })
    }
  } catch {
    res.render('404')
  }
}

exports.edit = async function (req, res) {
  let post = new Post(req.body, req.visitorId, req.params.id)
  console.log(post)
  try {
    let status = await post.update()
    // post was updated
    // or there were validation errors
    if (status == 'success') {
      // post updated
      req.flash('success', 'Post updated')
      req.session.save(() => {
        res.redirect(`/post/${req.params.id}/edit`)
      })
    } else {
      // validation error
      post.errors.forEach((error) => {
        req.flash('errors', error)
        req.session.save(() => {
          res.redirect(`/post/${req.params.id}/edit`)
        })
      })
    }
  } catch {
    // a post with the requested id doesn't exist
    // visitor is not the owner
    req.flash('errors', "You don't have permission to perform this action")
    req.session.save(() => {
      res.redirect('/')
    })
  }
}
