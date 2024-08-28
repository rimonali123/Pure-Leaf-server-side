const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))
app.use(express.json())

app.get("/", (req, res) => {
  res.send('My server with pureleaf project app')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wods307.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userDataCollection = client.db("PureLeafDB").collection("usersData");
    const cardDataCollection = client.db("PureLeafDB").collection("cardData");
    const cartItemDataCollection = client.db("PureLeafDB").collection("cartItemData");
    const wishListDataCollection = client.db("PureLeafDB").collection("wishListData");
    const userInfoCollection = client.db("PureLeafDB").collection("userInfo");

    // jwt related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_JWT_TOKEN_SECRET)
      res.send({ token })
    })

    // jwt midleware
    //   const verifyToken = (req, res, next) => {
    //     // console.log('inside verify token', req.headers);
    //     if (!req.headers.authorization) {
    //       return res.status(401).send({ message: 'unauthorize access' });
    //     }
    //     const token = req.headers.authorization.split(' ')[1];
    //     jwt.verify(token, process.env.ACCESS_JWT_TOKEN_SECRET, (err, decoded) => {
    //       if (err) {
    //         return res.status(401).send({ message: 'unauthorize access.can not verify' })
    //       }
    //       req.decoded = decoded;
    //       next();
    //     })

    //   }

    //   user data send to mongoDb database
    app.post('/usersData', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userDataCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userDataCollection.insertOne(user);
      res.send(result);
    });

    app.get('/usersData/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userDataCollection.findOne(query);
      res.send(result)

    })



    // data short by category here
    app.get('/cardData', async (req, res) => {
      const category = req.query.category;
      let query = {};

      if (category && category !== 'null') {
        query.category = category;
      }

      const result = await cardDataCollection.find(query).toArray();
      res.send(result);
    });


    app.post('/cartItemData', async (req, res) => {
      const cartData = req.body;
      const cartItemData = await cartItemDataCollection.insertOne(cartData);
      res.send(cartItemData)

    })


    app.post('/wishListData', async (req, res) => {
      const cartData = req.body;
      const cartItemData = await wishListDataCollection.insertOne(cartData);
      res.send(cartItemData)

    })


    app.get('/wishListData/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const result = await wishListDataCollection.find(query).toArray();
      res.send(result)
    })


    app.get('/cartItemData/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const result = await cartItemDataCollection.find(query).toArray();
      res.send(result)
    })



    app.delete('/cartItemData/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartItemDataCollection.deleteOne(query);
      res.send(result);
    })


    app.delete('/wishListData/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await wishListDataCollection.deleteOne(query);
      res.send(result);
    })


    app.get('/cardData/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cardDataCollection.findOne(query);
      res.send(result);
    })



    
    app.patch('/userInfo/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const options = { upsert: true };
      const updateUserInfo = req.body;
      const userData = {
        $set: {
          name: updateUserInfo.name,
          displayName: updateUserInfo.displayName,
          email: updateUserInfo.email,
          companyName: updateUserInfo.companyName,
          country: updateUserInfo.country,
          streetAddress: updateUserInfo.streetAddress,
          town: updateUserInfo.town,
          city: updateUserInfo.city,
          zipCode: updateUserInfo.zipCode,
          phoneNumber: updateUserInfo.phoneNumber,
        }
      }
      console.log(updateUserInfo)
      const result = await userInfoCollection.updateOne(query, userData, options);
      res.send(result)
    })


    app.get('/userInfo/:email', async(req, res) =>{
      const email = req.params.email;
      const query = {email:email};
      const result = await userInfoCollection.findOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`server app running on port ${port}`)
})