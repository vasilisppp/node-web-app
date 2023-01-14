const usersCollection = require('../db').db().collection('users')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const md5 = require('md5')

let User = function(data){
    this.data = data
    this.errors = []
}

User.prototype.cleanUp = function(){
    if (typeof(this.data.username)!="string"){
        this.data.username = ""
    }
    if (typeof(this.data.email)!="string"){
        this.data.email = ""
    }
    if (typeof(this.data.password)!="string"){
        this.data.password = ""
    }
    this.data = {
        username:this.data.username.trim().toLowerCase(),
        email:this.data.email.trim().toLowerCase(),
        password:this.data.password
    }
}

User.prototype.validate = function(){
    return new Promise(async (resolve, reject) => {
        if (this.data.username==""){
            this.errors.push("You must provide a username")
        }
        if (!validator.isEmail(this.data.email)){
            this.errors.push("You must provide a valid email")
        }
        if (this.data.password==""){
            this.errors.push("You must provide a password")
        }
        if (this.data.password.length<6 && this.data.password.length>0){
            this.errors.push("Password has to be at least 6 characters long")
        }
        if (this.data.password.length>100){
            this.errors.push("Password cannot exceed 100 characters")
        }
        if (this.data.username.length<3 && this.data.username.length>0){
            this.errors.push("Username has to be at least 3 characters long")
        }
        if (this.data.username.length>50){
            this.errors.push("Username cannot exceed 100 characters")
        }
        if (this.data.username!="" && !validator.isAlphanumeric(this.data.username)){
            this.errors.push("Username has to be alphanumeric")
        }
        // Check if username is taken only if valid
        if (this.data.username.length>=3 && this.data.username.length<=50 && validator.isAlphanumeric(this.data.username)){
            let usernameExists = await usersCollection.findOne({username:this.data.username})
            if (usernameExists){
                this.errors.push("Username is already taken")
            }
        }
        // Only if email is valid check if it's taken
        if (validator.isEmail(this.data.email)){
            let emailExists = await usersCollection.findOne({email:this.data.email})
            if (emailExists){
                this.errors.push("Email is already being used")
            }
        }
        resolve()
    })
}

User.prototype.login = function(){
    return new Promise((resolve, reject) => {
        this.cleanUp()
        usersCollection.findOne({username: this.data.username}).then((attemptedUser)=>{
            // use arrow function so that this keeps pointing at User object
            if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)){
                // email not available at this point since login is with username only
                this.data = attemptedUser
                this.getAvatar()
                resolve('congrats')
            } else {
                reject('invalid username/password')
            }
        }).catch(()=>{
            reject('please try again later')
        })
    })
}

User.prototype.register = function(){
    return new Promise(async (resolve,reject)=>{
        // validate user data
        this.cleanUp()
        await this.validate()
        // insert user in database
        if (!this.errors.length){
            // hash password
            let salt = bcrypt.genSaltSync(10)
            this.data.password = bcrypt.hashSync(this.data.password,salt)
            await usersCollection.insertOne(this.data)
            this.getAvatar()
            resolve()
        } else {
            reject(this.errors)
        }
    } )
}

User.prototype.getAvatar = function(){
    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}

module.exports = User