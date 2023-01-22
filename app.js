const express = require('express')
const session = require('express-session')
const flash = require('connect-flash')
const markdown = require('marked')
const MongoStore = require('connect-mongo')
const app = express()
const sanitizeHTML = require('sanitize-html')

let sessionOptions = session({
  secret: 'mfjdaibuufublasbdhibfbafyeqwbvsancz',
  store: MongoStore.create({ client: require('./db') }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
  },
})

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(sessionOptions)
app.use(flash())
app.use(express.static('public'))

app.set('views', 'views')
app.set('view engine', 'ejs')

app.use(function (req, res, next) {
  // make markdown function available from within ejs templates
  res.locals.filterUserHTML = function (content) {
    return sanitizeHTML(markdown.parse(content), {
      allowedTags: [
        'p',
        'br',
        'ul',
        'ol',
        'li',
        'strong',
        'bold',
        'i',
        'em',
        'h1',
        'h2',
        'h3',
        'h4',
      ],
      allowedAttributes: [],
    })
  }
  // make all error and success flash messages available
  // from all templates
  res.locals.errors = req.flash('errors')
  res.locals.success = req.flash('success')
  // make user id available on the req object
  if (req.session.user) {
    req.visitorId = req.session.user._id
  } else {
    req.visitorId = 0
  }
  // make user session data available from within view templates
  res.locals.user = req.session.user
  next()
})

const router = require('./router.js')

app.use('/', router)

module.exports = app
