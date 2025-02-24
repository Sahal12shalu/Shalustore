var mongoClient=require('mongodb').MongoClient
var state={
    db:null
}

module.exports.connect=function(done){
    var url='mongodb://localhost:27017'
    var dbname='deliverApp'

    mongoClient.connect(url,function(err,data){
        
            state.db=data.db(dbname)
       
    })
}
module.exports.get=function(){
    return state.db
}