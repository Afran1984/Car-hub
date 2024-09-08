// const express = require('express');
// const cors = require('cors');
// // const { MongoClient, ServerApiVersion } = require('mongodb');
// require('dotenv').config()
// const { MongoClient, ServerApiVersion } = require('mongodb');
// const req = require('express/lib/request');
// const app = express();
// const port = process.env.PORT || 5000;

// //middleware

// app.use(cors());
// app.use(express.json());

// console.log(process.env.BD_PASS)

// const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.bqiq2nz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();

//     const serviceCollection = client.db('Car-Doctor').collection('services');

//     app.get('/services', async(req,res)=>{
//       const cursor = serviceCollection.find();
//       const result = await cursor.toArray();
//       res.send(result);
//     })

//     // services Connection
//     app.get('/services/:id', async(req, res) => {
//       const id = req.params.id;
//       const query = {_id: new Object(id) }


//       const options = {
//         projection: { title: 1, price: 1, service_id: 1},
//       };

//       const result = await serviceCollection.findOne(query, options);
//       res.send(result);
//     })

//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);


// app.get('/', (req, res) => {
//     res.send('doctor is running')
// })

// app.listen(port, () => {
//     console.log(`car is running & server port number is ${port}`)
// })

const express = require('express');
const cors = require('cors');
// const cookieParser = require('cookie-parser')
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb'); // Include ObjectId
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

console.log(process.env.BD_PASS);

const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.bqiq2nz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const serviceCollection = client.db('Car-Doctor').collection('services');
        const bookingCollaction = client.db('Car-Doctor').collection('bookings');
        // Auth reletade data
        app.post('/jwt', async(req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
            res
            .cookie('token', token, {
                httpOnly: true,
                secure: false,
            })
            .send({success: true});
        })

        // service data
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const options = {
                projection: { title: 1, price: 1, service_id: 1, img: 1 },
            };

            const result = await serviceCollection.findOne(query, options);
            res.send(result);
        });

        // bookings
        app.get('/bookings', async(req, res) => {
            console.log(req.query.email);
            console.log('Cookies', req.cookies.token)
            let query ={};
            if(req.query?.email){
                query = {email: req.query.email}
            }
            const result = await bookingCollaction.find().toArray();
             res.send(result);
        })
        app.post('/bookings', async(req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await bookingCollaction.insertOne(booking);
            res.send(result);
        });
        app.patch('/bookings/:id', async(req, res) =>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const updatebookings = req.body;
            console.log(updatebookings);
            const uodateDoc = {
                $set:{
                    status: updatebookings.status
                },
            };
            const result = await bookingCollaction.updateOne(filter,uodateDoc);
            res.send(result);
        })
        

        app.delete('/bookings/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await bookingCollaction.deleteOne(query);
            res.send(result);
        })

        // app.post('/bookings', async (req, res) => {
        //     const bookingData = req.body;
        //     // Handle the booking data here
        //     res.json({ success: true, data: bookingData });
        // });
        

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('doctor is running');
});

app.listen(port, () => {
    console.log(`car is running & server port number is ${port}`);
});
