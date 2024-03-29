const { response } = require('express');
var express = require('express');
const session = require('express-session');
var router = express.Router();
var productHelpers  = require('../helpers/product-helpers')
const userHelpers  = require('../../helpers/user-helpers')
/* GET home page. */

const verifyLogin = (req,res,next)=>{
  if(req.session.userLoggedIn) next()
  else res.redirect('/login')
}

router.get('/',async function(req, res, next) {
  let user = req.session.user
  let cartCount = 0
  if(user) cartCount =await userHelpers.getCartCount(req.session.user._id)
  productHelpers.getAllProducts().then((products)=>{
  res.render("user/view-products",{ products, user,cartCount})
  })

});
router.get('/login',(req,res)=>{
  if(req.session.userLoggedIn){
    res.redirect("/")
  }
 else {res.render('user/login',{"loginErr":req.session.userLoginErr })
       req.session.userLoginErr=false}
})

router.get('/signup',(req,res)=>{
  res.render('user/signup')
})

router.post('/signup',(req,res)=>{
   userHelpers.doSignup(req.body).then((response)=>{
     req.session.user=  response
     req.session.userLoggedIn=true;
     res.redirect('/')
   })
})

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status==true){
      req.session.user = response.user
      req.session.userLoggedIn  =true;
      res.redirect('/')
    
    }
    else {
      req.session.userLoginErr = "invalid UserName or PassWord"
      res.redirect("/login")

    }

  })
})
router.get('/logout',(req,res)=>{
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res,next)=>{
  let products= await userHelpers.getCartProducts(req.session.user._id)
  let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
  res.render("user/cart",{products,user:req.session.user,totalValue})
})
router.get('/add-to-cart/:id',verifyLogin,((req,res)=>{
  proId= req.params.id
  userHelpers.addToCart(proId,req.session.user._id).then((e)=>{
    res.json({status:true})
  })
}))
//FUNCTION CALLED BY AJAX WILL NOT HAVE SESSION
router.post('/change-product-quantitiy',(req,res,next)=>{
  userHelpers.changeProductQuantity(req.body).then(async(e)=>{
     e.total = await userHelpers.getTotalAmount(req.body.userId)
    res.json(e)
  })
})
router.get('/place-order',verifyLogin,async(req,res)=>{
 let total = await userHelpers.getTotalAmount(req.session.user._id)
 res.render('user/place-order',{total, user:req.session.user}) 
})
router.post('/place-order',verifyLogin,async(req,res)=>{
  let products= await userHelpers.getCartProductList(req.body.userId)
  let total = await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,total).then((orderId)=>{
    if(req.body['payment-method']=='COD'){
    res.json({codSuccess:true})
    }else{
      userHelpers.generateRazorPay(orderId,total).then((response)=>{
        res.json(response)
      })
    }
     
      })
})
router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})

})
router.get('/orders', async(req,res)=>{
  let orders= await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders})
})
router.get('/view-order-products/:id',async(req,res)=>{
  let products = await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{user:req.session.user,products})
})
router.post('/verify-payment',(req,res)=>{
  userHelpers.verifyPayment(req.body).then((e)=>{
    
    console.log(e['order[receipt]'])
    userHelpers.changePaymentStatus(e['order[receipt]']).then(()=>{
      res.json({status:true})
    })
  }).catch((err)=>{
       res.json({status:false,errMsg:''})
  })
}
)
module.exports = router;
