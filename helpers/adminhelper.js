const db=require('../config/connection')
const Collection=require('../config/collections')
const { ObjectId } = require('mongodb')

// var ObjectId=require('mongodb').ObjectId

module.exports={
    adminlogindetails:(function(details){
            var response = {}
            return new Promise(async (resolve,reject)=>{
                var user = await db.get().collection(Collection.Adminlogin).findOne({name:details.username})
                if(user) 
                    db.get().collection(Collection.Adminlogin).findOne({password:details.password}).then(function(status){
                    if(status){
                    response.user=user
                    response.status=true
                    resolve(response)
                }else{
                    resolve({status:false})
                }
            })
            else{
                resolve({status:false})
                }
            })
        }),
    Addhoteldetail:(function(details){
        return new Promise((resolve,reject)=>{
            db.get().collection(Collection.Hoteldetails).insertOne(details).then((data)=>{
                resolve(data.insertedId.toString())
            })
        })
    }),
    gethotelproduct:(()=>{
        return new Promise((resolve, reject) => {
           db.get().collection(Collection.Hoteldetails).find().toArray().then((product)=>{
            resolve(product)
           })
        });
    }),
    gethoteldetails:function(userId){
        return new Promise(async(resolve,reject)=>{
            if(!ObjectId.isValid(userId)){
                return reject(new Error("invalid Objectid format"))
            }
            db.get().collection(Collection.Hoteldetails).find({_id:new ObjectId(userId)}).toArray().then((product)=>{
                resolve(product)
            })
            .catch(reject)
        })
    },
    addproductdetails:((product)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(Collection.Productdetail).insertOne(product).then((data)=>{
                resolve(data.insertedId.toString())
            })
        })
    }),
    gettopsellingproduct:((Hotid)=>{
        return new Promise(async(resolve,reject)=>{
            if(!ObjectId.isValid(Hotid)){
                return reject(new Error("invalid Objectid format"))
            }
            db.get().collection(Collection.Productdetail).find({hotid:Hotid,category:"topselling"}).toArray().then((product)=>{
                resolve(product)
            })
            .catch(reject)
        })
    }),
    getotherproducts:((Hotid)=>{
        return new Promise(async(resolve,reject)=>{
            if(!ObjectId.isValid(Hotid)){
                return reject(new Error("invalid Objectid format"))
            }
            db.get().collection(Collection.Productdetail).find({hotid:Hotid,category:"others"}).toArray().then((product)=>{
                resolve(product)
            })
            .catch(reject)
        })
    }),
    deletehoteldetail:((proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(Collection.Hoteldetails).deleteOne({_id:new ObjectId(proId)}).then(()=>{
                db.get().collection(Collection.Productdetail).deleteMany({hotid:proId}).then()
                resolve()
            })
        })
    }),
    editedhotelproduct:((proId,product)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(Collection.Hoteldetails).updateOne({_id:new ObjectId(proId)},{
                $set:{
                    hotelname:product.hotelname,
                    description:product.description,
                    vegornon:product.vegornon,
                    category:product.category,
                }
            }).then(()=>{
                resolve()
            })
        })
    }),
    getproductdetail:((hotId)=>{
        if(!ObjectId.isValid(hotId)){
            return reject(new Error("invalid Objectid format"))
        }
        return new Promise((resolve,reject)=>{
            db.get().collection(Collection.Productdetail).find({hotid:hotId}).toArray().then((response)=>{
                resolve(response)
            })
        })
    }),
    deleteproductdetail:((proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(Collection.Productdetail).deleteOne({_id:new ObjectId(proId)}).then(()=>{
                resolve()
            })
        })
    }),
    editproductdetailpage:((proId)=>{
        if(!ObjectId.isValid(proId)){
            return reject(new Error("invalid Objectid format"))
        }
        return new Promise((resolve,reject)=>{
            db.get().collection(Collection.Productdetail).find({_id:new ObjectId(proId)}).toArray().then((response)=>{
                resolve(response)
            })
        })
    }),
    editedproduct:((proId,items)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(Collection.Productdetail).updateOne({_id:new ObjectId(proId)},{
                $set:{
                    productname:items.productname,
                    description:items.description,
                    category:items.category,
                    favourites:items.favourites,
                    vegornon:items.vegornon,
                    prize:items.prize
                }
            }).then(()=>{
                resolve()
            })
        })
    }),
}