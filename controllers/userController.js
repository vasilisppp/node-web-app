exports.login = function(){

}

exports.logout = function(){
    
}

exports.register = function(req,res){
    console.log(req.body)
    res.send('register page')
}

exports.home = function(req,res){
    res.render('home-guest')
}