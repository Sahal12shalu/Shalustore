var express = require('express');
var {ObjectId} = require('mongodb')
var router = express.Router();
var adminhelper = require('../helpers/adminhelper')

/* GET users listing. */
router.get('/', function(req,res) {
  res.render('adminloginpage/adminlogin')
});
router.post('/adminlogin1',function(req,res){
    adminhelper.adminlogindetails(req.body).then((response)=>{
      if(response.status){
        res.render('adminloginpage/add-hotel',{adminnav:true})
      }else
       res.render('adminloginpage/adminlogin',{heyy:true})
    })
    
});
router.post('/hoteldetails',function(req,res){
  adminhelper.Addhoteldetail(req.body).then((id)=>{
    let image=req.files.image
    image.mv('./public/images/hotelpicture/'+id+'.jpg',function(err){
      if(err){
      res.redirect('/')
      }
    })
    res.render('adminloginpage/add-hotel',{adminnav:true})
  })
});
router.get('/add-product',function(req,res){
  adminhelper.gethotelproduct().then((product)=>{
    res.render('adminloginpage/add-product', {adminnav:true,proadd:true,product})
  })
});
router.post('/productdetails',async function(req,res){
  let {hotel, productname, description, category, favourites, vegornon,prize} = req.body;
  
  const newProduct = ({hotel, productname, description, category, favourites, vegornon, prize})
  
  let selectedvalue = req.body.hotel;
  let [hotid,hotelname]= selectedvalue.trim().split('|')
  newProduct.hotid = hotid;
  newProduct.hotelname = hotelname;

  let product= await adminhelper.gethotelproduct().then()
  adminhelper.addproductdetails(newProduct).then((id)=>{
    if(req.files){
      let image = req.files.image
    image.mv('./public/images/productimage/'+id+'.jpg',function(err){
      if(err){
      res.redirect('/')
      }
    })
    res.render('adminloginpage/add-product',{adminnav:true,product})
  }else{
    res.render('adminloginpage/add-product',{adminnav:true,product})
  }
  })
  }),
  router.get('/edithotel',function(req,res){
    adminhelper.gethotelproduct().then((product)=>{
      res.render('adminloginpage/hoteledit',{adminnav:true,product})
    })
  }),
  router.get('/edithoteldetailpage/:id',function(req,res){
    var id = req.params.id
    if(!ObjectId.isValid(id)){
      return res.status(400).send("invalid id format")
    }
    adminhelper.gethoteldetails(id).then((products)=>{
      res.render('adminloginpage/edithoteldetail',{adminnav:true,products})
    })
  }),
  router.get('/deletehoteldetail/:id',async function(req,res){
    adminhelper.deletehoteldetail(req.params.id).then(()=>{
      res.redirect('/admin/edithotel')
    })
  }),
  router.post('/edited-hotelproduct/:id',function(req,res){
   adminhelper.editedhotelproduct(req.params.id,req.body).then(()=>{
    if(req.files){
      let image = req.files.image
    image.mv('./public/images/hotelpicture/'+req.params.id+'.jpg',function(err){
      if(err){
      res.redirect('/admin/')
      }
    })
    res.redirect('/admin/edithotel')
  }else{
    res.redirect('/admin/edithotel')
  }
   })
  }),
  router.get("/adminhomepage",function(req,res){
    res.render('adminloginpage/add-hotel',{adminnav:true})
  }),
  router.post('/hotelselectionpopup',(async(req,res)=>{
    let id = req.body.hotel
    if(!ObjectId.isValid(id)){
      return res.status(400).send("invalid id format")
    }
    var products = await adminhelper.getproductdetail(id).then()
    res.render('adminloginpage/hotelproductview',{adminnav:true,products})
  })),
  router.post('/deleteproductdetail',((req,res)=>{
    adminhelper.deleteproductdetail(req.body.proId).then(()=>{
      res.json({status:true})
    })
  })),
  router.get('/editproductdetailpage/:id',function(req,res){
    let id = req.params.id
    adminhelper.editproductdetailpage(id).then((products)=>{
      res.render('adminloginpage/editproductdetail',{adminnav:true,products})
    })
  }),
  router.post('/edited-product/:id/:hotId',function(req,res){
    adminhelper.editedproduct(req.params.id,req.body).then(async()=>{
      if(req.files){
        let image = req.files.image
        image.mv('./public/images/productimage/'+req.params.id+'.jpg')
        let id = req.params.hotId
        if(!ObjectId.isValid(id)){
          return res.status(400).send("invalid id format")
        }
        var products = await adminhelper.getproductdetail(id).then()
        res.render('adminloginpage/hotelproductview',{adminnav:true,products})
      }else{
        let id = req.params.hotId
        if(!ObjectId.isValid(id)){
          return res.status(400).send("invalid id format")
        }
        var products = await adminhelper.getproductdetail(id).then()
        res.render('adminloginpage/hotelproductview',{adminnav:true,products})
      }
    })
  }),
  router.get('/adminlogout',((req,res)=>{
    req.session.destroy()
    res.redirect('/admin/')
  }))

module.exports = router;
