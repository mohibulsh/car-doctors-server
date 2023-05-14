const express =require('express')
const app =express()
const port =process.env.PORT || 5000;
const cors =require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
//midleware
app.use(cors())
app.use(express.json())
app.get('/',(req,res)=>{
    res.send('doctor server is runnig....')
})
//user name doctorDB
// password RJOlVQ7uEIUfRWK1

//mongodb 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.khyx0yo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const serviceCollection = client.db('carDoctor').collection('services')
// get the all services 
app.get('/services', async(req,res)=>{
  const cursor = serviceCollection.find()
  const result = await cursor.toArray();
  res.send(result)
})
//get special services 
app.get('/services/:id',async(req,res)=>{
  const id = req.params.id;
  const  query ={_id : new ObjectId(id)}
  const options = {
    projection : {title:1,service_id:1,price:1}
  }
  const result =await serviceCollection.findOne(query,options)
  res.send(result)
})
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.listen(port , ()=>{
    console.log(`doctors is running on${port}`)
})