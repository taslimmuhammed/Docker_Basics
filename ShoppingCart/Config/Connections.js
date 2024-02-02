const mongoClient = require('mongodb').MongoClient
const state = {
    db:null
}
module.exports.connect = (done)=>{
    //username = admin
    //password = password
    const url= 'mongodb://admin:password@localhost:27018'
    const dbname = 'shopping'

    mongoClient.connect(url,(err,data)=>{
      if(err) return done(err)
      state.db = data.db(dbname)
      
    })
    done()
}

module.exports.get  = ()=>{
    return state.db
}