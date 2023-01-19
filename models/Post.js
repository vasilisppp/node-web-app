const postsCollection = require('../db').db().collection('posts')
const ObjectId = require('mongodb').ObjectId
const User = require('../models/User')

let Post = function (data, userid, requestedPostId) {
  this.data = data
  this.userid = userid
  this.errors = []
  this.requestedPostId = requestedPostId
}

Post.prototype.cleanUp = function () {
  if (typeof this.data.title != 'string') {
    this.data.title = ''
  }
  if (typeof this.data.body != 'string') {
    this.data.body = ''
  }
  this.data = {
    title: this.data.title.trim(),
    body: this.data.body.trim(),
    createdDate: new Date(),
    author: ObjectId(this.userid),
  }
}

Post.prototype.validate = function () {
  if (this.data.title == '') {
    this.errors.push('You must provide a title')
  }
  if (this.data.body == '') {
    this.errors.push('You must provide a body')
  }
}

Post.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    this.validate()
    if (!this.errors.length) {
      // save post in db
      postsCollection
        .insertOne(this.data)
        .then(() => {
          resolve()
        })
        .catch(() => {
          this.errors.push('Please try again later')
          reject(this.errors)
        })
    } else {
      reject(this.errors)
    }
  })
}

Post.findSingleById = function (id, visitorId) {
  return new Promise(async function (resolve, reject) {
    if (typeof id != 'string' || !ObjectId.isValid(id)) {
      reject()
      return
    }
    
    let posts = await Post.reusablePostQuery([
      {$match:{_id: new ObjectId(id)}}
    ],visitorId)

    if (posts.length) {
      resolve(posts[0])
    } else {
      reject()
    }
  })
}

Post.reusablePostQuery = function (uniqueOperations, visitorId) {
  return new Promise(async function (resolve, reject) {
    let aggOperations = uniqueOperations.concat([
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorDocument',
        },
      },
      {
        $project: {
          title: 1,
          body: 1,
          createdDate: 1,
          authorId: "$author",
          author: { $arrayElemAt: ['$authorDocument', 0] },
        },
      },
    ])
    let posts = await postsCollection
      .aggregate(aggOperations)
      .toArray()
    // Clean up author property
    posts = posts.map(function (post) {
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar,
      }
      post.isVisitorOwner = post.authorId.equals(visitorId)
      return post
    })
    resolve(posts)
  })
}

Post.findByAuthorId = function (authorId) {
  return Post.reusablePostQuery([
    {$match:{author:ObjectId(authorId)}},
    {$sort:{createdDate:-1}}
  ])
}

Post.prototype.update = function(){
  return new Promise(async (resolve,reject)=>{
    try {
      let post = await Post.findSingleById(this.requestedPostId, this.userid)
      console.log(post)
      if (post.isVisitorOwner){
        // update the db
        let status = await this.actuallyUpdate()
        resolve(status)
      } else {
        reject()
      }
    } catch {
      reject()
    }
  })
}

Post.prototype.actuallyUpdate = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp()
    this.validate()
    console.log(this)
    if (!this.errors.length) {
      await postsCollection.findOneAndUpdate(
        { _id: new ObjectId(this.requestedPostId) },
        { $set: { title: this.data.title, body: this.data.body } }
      )
      resolve('success')
    } else {
      reject('failure')
    }
  })
}

module.exports = Post
