var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://127.0.0.1:27017';


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/submit',(req,res,next)=>{
  console.log(req.body)

  MongoClient.connect(url,(err,client)=>{
  if(err) console.log(err)
  else client.db("crossroads").collection("user").insertOne(req.body)
  })

  res.send(`Submission succeful ${req.body.first_name}`)
})


module.exports = router;
