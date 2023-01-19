const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')

// User routes
router.get('/', userController.home)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

// Post routes
router.get(
  '/create-post',
  userController.mustBeLoggedIn,
  postController.viewCreateScreen
)
router.post(
  '/create-post',
  userController.mustBeLoggedIn,
  postController.create
)
router.get('/post/:id', postController.viewSingle)
router.get('/post/:id/edit', postController.viewEditScreen)
// Profile rouutes
router.get(
  '/profile/:username',
  userController.ifUserExists,
  userController.profilePostsScreen
)
router.post('/post/:id/edit', postController.edit)

module.exports = router
