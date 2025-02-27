var {MongoClient} = require('mongodb')
var state = {
    db:null
}
module.exports.connect=function(done){
    const url='mongodb://localhost:27017'
    const dbname='deliverApp'

    MongoClient.connect(url).then(client => {
        state.db = client.db(dbname)
        done()
    })
}

module.exports.get=function(){
    return state.db
}