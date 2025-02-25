const db=require('../config/connection')
const Collection=require('../config/collections')
require('dotenv').config();
console.log(process.env.RAZORPAY_KEY_ID)
console.log(process.env.RAZORPAY_KEY_SECRET)
var bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb')
const Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  
  

module.exports={
    additems:(function(details){
        var rest={}
        return new Promise(async function(resolve,reject){
            details.password1 = await bcrypt.hash(details.password1,10)
            details.password2 = await bcrypt.hash(details.password2,10)
            db.get().collection(Collection.Logindetails).findOne({email:details.email}).then((response)=>{
                if (response){
                    rest.response=true
                    resolve(rest)
                }else{
                    db.get().collection(Collection.Logindetails).insertOne(details).then(function(data){
                        resolve({response:false})
                })
            }
            })
            
    })    
}),
    dologin:(function(details){
        var response = {}
        return new Promise(async (resolve,reject)=>{
            var user = await db.get().collection(Collection.Logindetails).findOne({email:details.username})
            if(user) 
                bcrypt.compare(details.password,user.password1).then(function(status){
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
    getsignupdeails:((userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(Collection.Logindetails).find({_id:ObjectId(userId)}).toArray().then((res)=>{
                resolve(res)
            })
        })
    }),
    getfavoriteproduct:((res)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(Collection.Productdetail).find({favourites:res.key}).toArray().then((product)=>{
                resolve(product)
            })
        })
    }),
    addreview: function (details) {
        
        return new Promise(async (resolve, reject) => {
            try {
                // Ensure rating is stored as a number
                details.rating = parseFloat(details.rating);
        
                    await db.get().collection(Collection.Reviewdetails).insertOne(details);
    
                // Calculate the average rating for the hotel
                const hotelReviews = await db.get().collection(Collection.Reviewdetails)
                    .aggregate([
                        { $match: { hotelname: details.hotelname } },
                        { 
                            $group: { 
                                _id: "$hotelname", 
                                avgRating: { $avg: "$rating" },
                                ratingCount: {$sum:1}
                            } },
                    ])
                    .toArray();
    
                if (hotelReviews.length > 0) {
                    const avgRating = hotelReviews[0].avgRating.toFixed(1); // Round to 1 decimal place
                    const ratingCount = hotelReviews[0].ratingCount

                    // Update the average rating in the hotels collection
                    await db.get().collection(Collection.Hoteldetails)
                        .updateOne({hotelname: details.hotelname }, { $set: { avgRating: parseFloat(avgRating), ratingCount: ratingCount} });


                    resolve({ success: true, avgRating , ratingCount });
                } else {
                    resolve({ success: true, avgRating: null ,ratingCount:0 });
                }
            } catch (error) {
                reject(error);
       }
    });
    },
    addToCart:((proId,hotId,userId,prize,totalprize)=>{
        
        var Proobj={
            item:new ObjectId(proId),
            hotelId:hotId,
            quantity:1,
            prize:prize,
            totalprize:Number(totalprize),
        }
        return new Promise(async(resolve,reject)=>{
            var userExist = await db.get().collection(Collection.Cartproduct).findOne({user:ObjectId(userId)})
            if(userExist){
                let existinghotId = userExist.product.length > 0 ? userExist.product[0].hotelId : null;
                
                if(existinghotId && existinghotId !== hotId){
                    db.get().collection(Collection.Cartproduct).updateOne({user:ObjectId(userId)},
                {$set: {product:[Proobj]}}).then(()=>{
                    resolve()
                })
            }else{
                
                var proExist=userExist.product.findIndex(products=> products.item==proId)
                if(proExist !== -1)
                    {
                       db.get().collection(Collection.Cartproduct)
                    .updateOne({user:ObjectId(userId),'product.item':ObjectId(proId)},{$inc:{'product.$.quantity':1,'product.$.totalprize':totalprize}}
                    
                ).then(()=>{
                    resolve()
                })
                    
                }else{
                    db.get().collection(Collection.Cartproduct).updateOne({user:ObjectId(userId)},{
                        $push:{product:Proobj}
                })
            .then(()=>{
            resolve()
        })
            }
        }
            }else{
                var cartObj={
                    user:ObjectId(userId),
                    productId:proId,
                    product:[Proobj]
                }
            db.get().collection(Collection.Cartproduct).insertOne(cartObj).then(()=>{
            resolve()
           })
          }
        })
    }),
    getcartproducts:((userId)=>{
        return new Promise(async function(resolve,reject){
            var cartItems=await db.get().collection(Collection.Cartproduct).aggregate([
                {
                    $match:{user:ObjectId(userId)}
                },
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        item:'$product.item',
                        quantity:'$product.quantity',
                        totalprize:'$product.totalprize'
                    },   
                },
                {
                    $lookup:{
                        from:Collection.Productdetail,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    },
                },
                {
                    $addFields: {
                        'product.totalprize' : '$totalprize',
                        'product.quantity' : '$quantity',
                    },
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        product:{$arrayElemAt:['$product',0]}
                    },
                }
            ]).toArray()
            resolve(cartItems)
    })
    }),
    carthoteldetail:((hotId)=>{
         return new Promise(async(resolve,reject)=>{
            var carthotelId =await db.get().collection(Collection.Hoteldetails).find({_id:ObjectId(hotId)}).toArray().then()
            resolve(carthotelId)
            
        })
    }),
    gettotalcartlength:((userId)=>{
        return new Promise(async(resolve,reject)=>{
           var cart =await db.get().collection(Collection.Cartproduct).findOne({user:ObjectId(userId)})
           if(cart){
            const productCount =await cart.product.length;
            resolve(productCount)
           }else{
            resolve()
           }
        })
    }),
    changeproductquantity:((items)=>{
        items.prize=parseInt(items.prize)
        items.count=parseInt(items.count)
        items.quantity=parseInt(items.quantity)
        return new Promise(async(resolve,reject)=>{
            if(items.count==-1 && items.quantity==1){
                db.get().collection(Collection.Cartproduct)
                .updateOne({_id:ObjectId(items.cart)},
                {
                    $pull:{product:{item:ObjectId(items.product)}}
                }
            ).then(()=>{
                resolve({heyy:true})
            })
            }else{
           db.get().collection(Collection.Cartproduct)
                    .updateOne({_id:ObjectId(items.cart),'product.item':ObjectId(items.product)},
                    {$inc:{'product.$.quantity':items.count,'product.$.totalprize':items.prize}}
                ).then()
                    resolve({status:true})
            }
        })
    }),
    deletecartproduct:((items)=>{
        return new Promise(async(resolve,reject)=>{
            var check =await db.get().collection(Collection.Cartproduct).updateOne({_id:ObjectId(items.cartId)},
            {
                $pull:{product:{item:ObjectId(items.proId)}}
            }
        )
            resolve(check)
        })
    }),
    gettotalamount:((userId)=>{
        return new Promise(async function(resolve,reject){
            var total=await db.get().collection(Collection.Cartproduct).aggregate([
                {
                    $match:{user:ObjectId(userId)}
                },
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        item:'$product.item',
                        quantity:'$product.quantity'
                    }   
                },
                {
                    $lookup:{
                        from:Collection.Productdetail,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        product:{$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity',{$toInt:'$product.prize'}]}}
                    }
                }
            ]).toArray()
            resolve(total[0].total)
    })
    }),
    getproducttotal:((userId,proId)=>{
        return new Promise(async (resolve,reject)=>{
            var total=await db.get().collection(Collection.Cartproduct).aggregate([
                {
                    $match: {
                        user: ObjectId(userId),
                        "product.item": ObjectId(proId) // Ensure matching with ObjectId
                    }
                },
                { $unwind: "$product" }, // Flatten the product array
                {
                    $match: { "product.item": ObjectId(proId) } // Ensure correct match
                },
                {
                    $project: {
                        quantity: { $toInt: "$product.quantity" }, // Convert to number
                        prize: { $toInt: "$product.prize" } // Convert prize to number
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ["$quantity", "$prize"] } } // Calculate total
                    }
                }
            ]).toArray();

            resolve(total[0].total)
        })
    }),
    addaddressdetails:((details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(Collection.Addressdetails).insertOne(details).then((data)=>{
                resolve(data.insertedId.toString())
            })
        })
    }),
    getsingleaddressdetails:((userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(Collection.Addressdetails).find({user:userId})
            .sort({_id:-1})
            .limit(1)
            .toArray().then((response)=>{
                resolve(response[0])
            })
        })
    }),
    getaddressdetails:((userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(Collection.Addressdetails).find({user:userId}).toArray().then((response)=>{
                resolve(response)
            })
        })
    }),
    deleteaddress:((proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(Collection.Addressdetails).deleteOne({_id:ObjectId(proId)}).then(async(res)=>{
                var address = await db.get().collection(Collection.Addressdetails).find({_id:ObjectId(proId)}).toArray().then()
                if(address.length>1){
                resolve({status:true})
                }else{
                    resolve({heyy:true})
                }
            })
        })
    }),
    grandtotal:((total)=>{
        return new Promise(async(resolve,reject)=>{
            var grandtotal =await total+24;
            resolve(grandtotal)
        })
    }),
    addconfirmproducts:((userId,product,grandttoal,method,totalamount)=>{
        var hotelname = product[0].product.hotelname;
        var hotelId = product[0].product.hotid;
        var status = method === 'cod'?'placed':'pending'
        return new Promise(async(resolve,reject)=>{
                var Newuser ={
                    user:ObjectId(userId),
                    paymentmethod : method === 'cod'?'Cash On Delivery':'Online-Payment',
                    product,
                    grandttoal:grandttoal,
                    totalamount:totalamount,
                    hotelname:hotelname,
                    hotelId:hotelId,
                    status:status,
                    date:new Date()
                }
            db.get().collection(Collection.Confirmproducts).insertOne(Newuser).then((data)=>{
                db.get().collection(Collection.Cartproduct).deleteOne({user:ObjectId(userId)})
                resolve()
            })
        })
    }),
    getaddressdetail:((addressId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(Collection.Addressdetails).find({_id:ObjectId(addressId)}).toArray().then((products)=>{
                resolve(products)
            })
        })
    }),
    getcartproductlist:((userId)=>{
        return new Promise(async(resolve,reject)=>{
            var user=await db.get().collection(Collection.Cartproduct).findOne({user:ObjectId(userId)})
            resolve(user.product)
        })
    }),
    getconfirmproducts:((userId)=>{
        return new Promise(async(resolve,reject)=>{
            var cartItems=await db.get().collection(Collection.Confirmproducts).find({user:ObjectId(userId)}).toArray()
            resolve(cartItems)
        })
    }),
    razorpaygenerate:((orderId,totalamount)=>{
        return new Promise((resolve,reject)=>{
            var options = {
                amount: totalamount,
                currency: "INR",
                receipt: orderId,
            }
            instance.orders.create(options,function(err,order){
                resolve(order)
            });
        })
    }),
    verifypayment:function(details){
        return new Promise((resolve,reject)=>{
            const crypto=require('crypto');
            let hmac=crypto.createHmac('sha256','QVkNW3R3rDSG4QCbM82VP5p9')

            hmac.update(details['response']['razorpay_order_id']+'|'+details['response']['razorpay_payment_id']);
            let hmacs=hmac.digest('hex')
            if(hmacs==details['response']['razorpay_signature']){
                resolve()
            }else{
                reject()
            }
        })
    },
    changepaymentstatus:function(orderId){
        return new Promise((resolve,reject)=>{
            db.get().collection(Collection.Confirmproducts)
            .updateOne({_id:ObjectId(orderId)},
            {
                $set:{
                    status:'placed'
                }
            }
        ).then((response)=>{
            resolve()
        })
        })
    },
    addprofileimageplaced:((userId)=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(Collection.Logindetails).updateOne({_id:ObjectId(userId)},{
                $set:{status:'placed'},
            },
            {upsert:true}
        ).then(()=>{
            resolve()
        })
        })
    }),
    addcontactlis:((items)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(Collection.Conatctus).insertOne(items).then(()=>{
                resolve()
            })
        })
    })
    
}