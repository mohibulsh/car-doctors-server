const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
//midleware
app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
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

async function run() {
  try {
    //jwt routes
    app.post('/jwt', (req, res) => {
      const user = req.body
      console.log(user)
      var token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token })
    })


    const serviceCollection = client.db('carDoctor').collection('services')
    const bookingCollection = client.db('carDoctor').collection('booking')

    // get the all services 
    app.get('/services', async (req, res) => {
      const cursor = serviceCollection.find()
      const result = await cursor.toArray();
      res.send(result)
    })
    //get special services 
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const options = {
        projection: { title: 1, service_id: 1, price: 1, img: 1 }
      }
      const result = await serviceCollection.findOne(query, options)
      res.send(result)
    })
    //varify the bookings token
    const varifyToken = (req, res, next) => {
      const authorization = req.headers.authorization;
      if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorize access' })
      }
      const token = authorization.split(' ')[1];
      // verify a token symmetric
      jwt.verify(token,process.env.ACCESS_TOKEN_SECRET ,  (err, decoded)=> {
        if(err){
          return res.status(403).send({error:true, message:'unauthorized access'})
        }
        req.decoded=decoded;
        next()
      });
    }
    //some data get depends on email
    app.get('/bookings', varifyToken, async (req, res) => {
      // console.log(req.query)
      const decoded =req.decoded;
      if(decoded.email!==req.query.email){
        return res.status(403).send({error:1,message:'forbided'})
      }
      let query = {}
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const cursor = bookingCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })
    //isnert the data get the client sites to the database
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking)
      res.send(result)
    })
    //delete the bookings 
    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.deleteOne(query)
      res.send(result)
    })
    // Confirm update status
    app.patch('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const bookingsData = req.body;
      console.log(bookingsData)
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          status: bookingsData.status
        },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

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

app.listen(port, () => {
  console.log(`doctors is running on${port}`)
})