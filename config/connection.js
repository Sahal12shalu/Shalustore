
var {MongoClient} = require('mongodb')
var state = {
    db:null
}
module.exports.connect=function(done){
    const url='mongodb+srv://sahalshalu806:5LanKxkvvkF83Xtc@cluster0.chia3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    const dbname='deliverApp'

    MongoClient.connect(url).then(client => {
        state.db = client.db(dbname)
    })
}

module.exports.get=function(){
    return state.db
}