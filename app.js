const express = require('express')
const session = require('express-session')
const flash = require('connect-flash')
const MongoStore = require('connect-mongo')
const app=express()

let sessionOptions = session({
    secret: "mfjdaibuufublasbdhibfbafyeqwbvsancz",
    store: MongoStore.create({client : require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true
    }
})

const router = require('./router.js')

app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(sessionOptions)
app.use(flash())
app.use(express.static('public'))

app.set('views','views')
app.set('view engine','ejs')

app.use('/',router)

module.exports = app