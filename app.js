const express = require('express')
const app=express()

const path = require('path')

app.use(express.static('public'))
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

app.get('/', function(req,res){
    console.log(app.get('views'))
    res.render('home-guest')
})

app.listen(3000)