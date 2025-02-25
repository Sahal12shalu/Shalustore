var express = require('express');
var router = express.Router();
var {ObjectId} = require('mongodb')
const userhelper=require('../helpers/userhelper')
const adminhelper=require('../helpers/adminhelper');
/* GET home page. */
router.get('/', function (req, res) {
  res.render('loginpage/logopage')
});
router.get('/login', function (req, res) {
    res.render('loginpage/login')
});
router.post('/signup',function(req,res){
  userhelper.additems(req.body).then((rest)=>{
    if(rest.response){
      res.render('loginpage/login',{hello:true})
    }else{
    res.redirect('/login')
    }
  })
}),
router.get('/homepage',async function(req,res){
  var products =await adminhelper.gethotelproduct().then()
  var total = await userhelper.gettotalcartlength(req.session.user._id).then()
  res.render('frontpage/frontpage',{navbar:true,products,resturant:true,homepage:true,total})
}),
router.post('/login',function(req,res){
  userhelper.dologin(req.body).then(async(response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      var products =await adminhelper.gethotelproduct().then()
      var total = await userhelper.gettotalcartlength(req.session.user._id).then()
        res.render('frontpage/frontpage',{navbar:true,products,resturant:true,homepage:true,total})
    }else
     res.render('loginpage/login',{heyy:true})
  })
}),
router.get('/carddetail/:id',async function(req,res){
  let id = req.params.id
  if(!ObjectId.isValid(id)){
    return res.status(400).send("invalid id format")
  }
  var product = await adminhelper.gethoteldetails(id).catch(err=>{
    console.error(err)
    res.status(500).send("error fetching hotel details")
  })
  var products = await adminhelper.gettopsellingproduct(id).catch(err=>{
    console.error(err)
    res.status(500).send("error fetching hotel details")
  })
  var othpro = await adminhelper.getotherproducts(id).catch(err=>{
    console.error(err)
    res.status(500).send("error fetching hotel details")
  })
  var total = await userhelper.gettotalcartlength(req.session.user._id).then()
    res.render('frontpage/productdetail',{navbar:true,product,products,othpro,total})
  }),
  router.get('/favorites',(req,res)=>{
   userhelper.getfavoriteproduct(req.query).then(async (products)=>{
   var product = products[0]
   var total = await userhelper.gettotalcartlength(req.session.user._id).then()
      res.render('frontpage/favourites',{navbar:true,products,product,total})
   })
  })
  router.post('/reviewsubmit/:hotelname',function(req,res){
    req.body.hotelname = req.params.hotelname
    userhelper.addreview(req.body).then((response)=>{
      res.json(response)
    })
  }),
  router.post('/add-to-cart',async function(req,res){
    var totalprize = Number(req.body.prize)
  userhelper.addToCart(req.body.proId,req.body.hotelId,req.session.user._id,req.body.prize,totalprize).then(async()=>{
    res.json({status:true})
  })
  }),
  router.get('/cartpage',async function(req,res){
    userhelper.getcartproducts(req.session.user._id).then(async(response)=>{
     if(response.length>0){
      var carthoteldetail =await userhelper.carthoteldetail(response[0].product.hotid).then()
      var totalamount =await userhelper.gettotalamount(req.session.user._id).then()
      var total = await userhelper.gettotalcartlength(req.session.user._id).then()
      var address =await userhelper.getsingleaddressdetails(req.session.user._id).then()
      var addresses =await userhelper.getaddressdetails(req.session.user._id).then()
      var grandtotal =await userhelper.grandtotal(totalamount).then()
      res.render('cart-checkout/cartpage',{navbar:true,response,carthoteldetail,total,user:req.session.user,totalamount,address,addresses,grandtotal})
      }else{
        res.render('cart-checkout/cartempty',{navbar:true})
      }
    })
  }),
  router.get('/logout',function(req,res){
    req.session.destroy()
    res.redirect('/carddetail')
  }),
  router.post('/change-product-quantity',async function(req,res){
     userhelper.changeproductquantity(req.body).then(async(response)=>{
      if(response.status){
      response.getproducttotal =await userhelper.getproducttotal(req.session.user._id,req.body.product).then()
      totalamount =await userhelper.gettotalamount(req.session.user._id).then()
      response.totalamount =await totalamount
      response.grandtotal =await userhelper.grandtotal(totalamount).then()
      res.json(response)
      }else{
        res.json(response)
      }
   })
  }),
  router.post('/deletecartproduct',function(req,res){
    userhelper.deletecartproduct(req.body).then(async()=>{
      var total =await userhelper.gettotalcartlength(req.session.user._id).then()
      res.json(total)
    })
  }),
  router.post('/addresssubmit',function(req,res){
    req.body.user = req.session.user._id
    userhelper.addaddressdetails(req.body).then(()=>{
      res.json({status:true})
    })
  }),
  router.post('/deleteaddress',((req,res)=>{
    var proId = req.body.proId
    userhelper.deleteaddress(proId).then((response)=>{
      res.json(response)
    })
  })),
  router.get('/checkout/:id',(async(req,res)=>{
   var addressId = req.params.id
   var totalamount =await userhelper.gettotalamount(req.session.user._id).then()
   var grandtotal =await userhelper.grandtotal(totalamount).then()
    res.render('cart-checkout/paymentpage',{navbar:true,grandtotal,addressId})
  })),
  router.post('/codconfirm',async function(req,res){
    var method = 'cod'
    var product =await userhelper.getcartproducts(req.session.user._id).then()
    var totalamount =await userhelper.gettotalamount(req.session.user._id).then()
    var grandtotal =await userhelper.grandtotal(totalamount).then()
    
    userhelper.addconfirmproducts(req.session.user._id,product,grandtotal,method,totalamount).then(()=>{
      res.json({status:true})
      })
     }),
  router.get('/trackpage',((req,res)=>{
    res.render('successpages/trackpage',{navbar:true})
  })),
  router.get('/orderspage',async function(req,res){
    var alldetails =await userhelper.getconfirmproducts(req.session.user._id).then()
    
    if(alldetails.length>0){
      alldetails.hotelId = alldetails[0].product[0].product._id
    res.render('successpages/orderhistory',
      {navbar:true,alldetails,status:true})
    }else{
      res.render('successpages/orderhistory',{navbar:true,status:false})
    }
  }),
  router.post('/onlinepayment',async(req,res)=>{
    var method = 'onlinepayment'
    var product =await userhelper.getcartproducts(req.session.user._id).then()
    var totalamount =await userhelper.gettotalamount(req.session.user._id).then()
    var grandtotal =await userhelper.grandtotal(totalamount).then()
    
    userhelper.addconfirmproducts(req.session.user._id,product,grandtotal,method,totalamount).then(async()=>{
      var alldetails =await userhelper.getconfirmproducts(req.session.user._id).then()
      var totalamount = alldetails[0].totalamount
      var orderId = alldetails[0]._id
      userhelper.razorpaygenerate(orderId,totalamount).then((response)=>{
       res.json(response)
      })
    })
    }),
  router.post('/verify-payment',function(req,res){
    userhelper.verifypayment(req.body).then(()=>{
      userhelper.changepaymentstatus(req.body['order']['receipt']).then(()=>{
        res.json({status:true})
      })
    })
    .catch((err)=>{
      console.log(err)
      res.json({status:false})
      })
  }),
  router.get('/profile',(req,res)=>{
    userhelper.getsignupdeails(req.session.user._id).then((details)=>{
      res.render('successpages/profilepage',{navbar:true,details})
    })
  }),
  router.post('/changeprofile',async function(req,res){
    userhelper.addprofileimageplaced(req.session.user._id).then()
    let image=req.files.image
    image.mv('./public/images/profileimage/'+req.session.user._id+'.jpg',function(err){
      if(err){
      res.redirect('/')
      }
    })
    res.redirect('/profile')
  }),
  router.get('/aboutuspage',((req,res)=>{
    res.render('successpages/aboutsuspage',{navbar:true})
  })),
  router.get('/terms',((req,res)=>{
    res.render('successpages/terms&condition',{navbar:true})
  })),
  router.get('/contact',function(req,res){
    res.render('successpages/contactpage',{navbar:true})
  }),
  router.post('/contactlist',function(req,res){
    userhelper.addcontactlis(req.body).then(()=>{
      res.redirect('/contact')
    })
  }),

module.exports = router;