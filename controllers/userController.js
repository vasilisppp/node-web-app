const User = require('../models/User')

exports.login = function(req,res){
    console.log(req.body)
    let user = new User(req.body)
    user.login().then(function(result){
        req.session.user = {
            username : user.data.username
        }
        req.session.save(()=>res.redirect('/'))
    }).catch(function(e){
        req.flash('errors',e)
        req.session.save(()=>res.redirect('/'))
    })
}

exports.logout = function(req,res){
    req.session.destroy(()=>{
        res.redirect('/')
    })
}

exports.register = async function(req,res){
    let user = new User(req.body)
    user.register().then(()=>{
        req.session.user = {username:user.data.username}
        req.session.save(()=>res.redirect('/'))
    }).catch((regErrors)=>{
        regErrors.forEach((error)=>{
            req.flash('regErrors',error)
        })
        req.session.save(()=>res.redirect('/'))
    })
    
}

exports.home = function(req,res){
    if (req.session.user){
        res.render('home-dashboard',{username:req.session.user.username})
    } else {
        res.render('home-guest',
                    {
                        errors:req.flash('errors'),
                        regErrors:req.flash('regErrors')
                    })
    }
}