var mongoclient =require('mongodb').MongoClient
var state={
    db:null
}

module.exports.connect=function(done){
    var url='mongodb://localhost:27017'
    var dbname='deliverApp'

    mongoclient.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true }, function(err,data){
        if(err) return done(err);
            state.db=data.db(dbname);
       
    })
}
module.exports.get=function(){
    return state.db
}