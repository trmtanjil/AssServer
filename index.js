const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port =process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.ROOMFW_USER}:${process.env.ROOMFW_PASS}@trmcamp0.7libfgs.mongodb.net/?retryWrites=true&w=majority&appName=trmcamp0`;

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
    await client.connect();
    const productCllection = client.db('roomdb').collection('uerrooms')

    // get all data 
    app.get('/uerrooms',async(req,res)=>{
        const result = await productCllection.find().toArray();
        res.send(result)
    })
    //get user email varifid data
    app.get('/uerrooms/byemail',async(req,res)=>{
      const email =req.query.email;
      if(!email){
        return res.send([]);
      }
      const result =await productCllection.find({ 
         email: { $regex: new RegExp(`^${email}$`, 'i') }
        }).toArray()
      res.send(result)
    })
    //availabelonly
  app.get('/uerrooms/availabality', async (req, res) => {
  const { searchParams } = req.query;

  let query = { availabality: "Available" };

  if (searchParams) {
    query.$or = [
      { title: { $regex: searchParams, $options: "i" } },
      { price: { $regex: searchParams, $options: "i" } },
      { location: { $regex: searchParams, $options: "i" } }
    ];
  }

  const result = await productCllection.find(query).sort({ _id: -1 }).limit(6).toArray();
  res.send(result);
})

    // availabality on data 
         //availabelonly on data
      app.get('/uerrooms/availabality/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await productCllection.findOne(query)
        res.send(result)
    })



    //get all data 
    app.get('/uerrooms/:id',async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await productCllection.findOne(query)
        res.send(result)
    })
    // server data add 
    app.post('/uerrooms',async(req,res)=>{
         const newProduct = req.body
         const result = await productCllection.insertOne(newProduct);
         res.send(result)
        })

        // count like 

    app.patch('/uerrooms/count/:id',async(req,res)=>{
      const {id}=req.params;
      const {userEmail}=req.body;

      const filter = {_id: new ObjectId(id)};
      const post = await productCllection.findOne(filter)

      if(post?.email ===userEmail){
        return res.status(403).send({message: "You connot like your own post "})
      }

      const update ={
        $inc:{likecount:1}
      };
      const result = await productCllection.updateOne(filter,update)
      res.send(result)
    })
    //data update

        app.put('/uerrooms/:id',async(req,res)=>{
          const {id} =req.params;
          const {title,location,price,image,contactInfo,roomType,lifestyle,availabality,textarea}=req.body;
          const query ={_id: new ObjectId(id)};

          const updateData={
            $set:{
              title,
              location,
              price,
              image,
              contactInfo,
              roomType,
              lifestyle,
              availabality,
              textarea
            }
          }
          const result =await productCllection.updateOne(query ,updateData)
          res.send(result)
        })

        //server handle delete 
        app.delete('/uerrooms/byemail/:id', async(req,res)=>{
          const id =req.params.id;
          const query = {_id: new ObjectId(id)}
          const result = await productCllection.deleteOne(query)
          res.send(result)

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


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
