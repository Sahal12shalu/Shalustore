var {MongoClient} = require('mongodb')
var state = {
    db:null
}
module.exports.connect=function(done){
    const url='mongodb+srv://userr2000:yweuG9Nr1j3XldnS@cluster0.qpean.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    const dbname='deliverApp'

     MongoClient.connect(url)
    .then(client => {
        state.db = client.db(dbname)
        console.log('mongodb connected')
    })
}

module.exports.get=function(){
    if(!state.db){
        console.error('state db error')
    }
    return state.db
}

