const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require("express");
const cors = require("cors");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pqpiudt.mongodb.net/?retryWrites=true&w=majority`;

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
        client.connect();

        // collections
        const toysCollection = client.db("toyMarketplace").collection("toys");
        const reviewsCollection = client.db("toyMarketplace").collection("reviews");

        // post toys single data
        app.post("/toys", async (req, res) => {
            const toy = req.body;
            const result = await toysCollection.insertOne(toy);
            res.send(result);
        });

        // get all toys data
        app.get("/toys", async (req, res) => {
            const limit = req.query.limit;
            const result = await toysCollection.find().limit(parseInt(limit)).toArray();
            res.send(result);
        });

        // get data by search query
        app.get("/toysSearch", async (req, res) => {
            const searchText = req.query.search;
            const query = { toyName: searchText };
            const result = await toysCollection.find(query).toArray();
            res.send(result);
        });

        // get single toy data
        app.get("/toy/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result);
        });

        // get data by sub category name
        app.get("/toys/:subCategoryName", async (req, res) => {
            const subCategoryName = req.params.subCategoryName;
            const query = { subCategory: subCategoryName };
            const cursor = toysCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // get specific data with email
        app.get("/usersToys", async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = { sellerEmail: req.query.email };
            }
            const result = await toysCollection.find(query).toArray();
            res.send(result);
        });

        // get data for edit
        app.get("/editToy/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result);
        });

        // update / patch toy info
        app.patch("/updateToy/:id", async (req, res) => {
            const id = req.params.id;
            const toyInfo = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateToy = {
                $set: {
                    price: toyInfo?.price,
                    quantity: toyInfo?.quantity,
                    description: toyInfo?.description,
                },
            };
            const result = await toysCollection.updateOne(filter, updateToy);
            res.send(result);
        });

        // post reviews
        app.post("/reviews", async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });

        // load reviews
        app.get("/reviews", async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result);
        });

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
    res.send('Toy marketplace server side is running!');
});

app.listen(port, () => {
    console.log(`Toy marketplace listening on port ${port}`);
});