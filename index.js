const express = require("express");
const app = express();
const port = process.env.PORT || 7000;
// dotenv
require("dotenv").config();

// middleWare
const cors = require("cors");
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hnh2r40.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    /*_____________________________________________________________________*/
    const dbCollection1 = client.db("supremeToy").collection("cars");

    app.get("/cars", async (req, res) => {
      const result = await dbCollection1.find().toArray();
      res.send(result);
    });
    // TAB-1
    app.get("/cars/:any", async (req, res) => {
      // console.log(req.params.any)
      if (
        req.params.any == "hatchback" ||
        req.params.any == "convertible" ||
        req.params.any == "sports"
      ) {
        const result = await dbCollection1
          .find({ subcategory: req.params.any })
          .toArray();
        return res.send(result);
      }
      // else
      const result = await dbCollection1.find().toArray();
      res.send(result);
    });
    // dynamic id for viewDetails
    app.get("/carsById/:ID", async (req, res) => {
      const id = req.params.ID;
      const filter = { _id: new ObjectId(id) };
      const result = await dbCollection1.findOne(filter);
      res.send(result);
    });
    /*_____________________________________________________________________*/

    // collection make for POST & PUT/ PATCH method
    const dbCollection = client.db("supremeToy").collection("postByToys");

    // POST
    app.post("/postToys", async (req, res) => {
      const data = req.body;
      // console.log(data)
      const result = await dbCollection.insertOne(data);
      res.send(result);
    });
    // GET POST
    app.get("/getPostToys", async (req, res) => {
      const result = await dbCollection.find().toArray();
      res.send(result);
    });
    // TAB-2
    app.get("/getPostToys/:any", async (req, res) => {
      console.log(req.params.any);
      if (
        req.params.any == "hatchback" ||
        req.params.any == "convertible" ||
        req.params.any == "sports"
      ) {
        const result = await dbCollection
          .find({
            subcategory: req.params.any,
          })
          .toArray();
        return res.send(result);
      }
      const result = await dbCollection.find().toArray();
      res.send(result);
    });

    // dynamic id for viewDetailAddToy
    app.get("/getPostToysById/:ID", async (req, res) => {
      const id = req.params.ID;
      const filter = { _id: new ObjectId(id) };
      const result = await dbCollection.findOne(filter);
      res.send(result);
    });

    /*_____________________________________________________________*/
    // search indexing: apply title & category
    app.get("/indexing/:any", async (req, res) => {
      const text = req.params.any;
      const result = await dbCollection
        .find({
          $or: [
            { name: { $regex: text, $options: "i" } },
            { subcategory: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });

    /*_____________________________________________________________*/

    // email api
    app.get("/toGetEmail/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await dbCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    // update
    app.patch("/updated/:ID", async (req, res) => {
      const id = req.params.ID;
      const updatedData = req.body;
      // console.log(updatedData)
      const filer = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          //update what you want
          price: updatedData.price,
          quantity: updatedData.quantity,
          description: updatedData.description,
        },
      };
      const result = await dbCollection.updateOne(filer, updatedDoc);
      res.send(result);
    });
    // delete
    app.delete("/deleted/:ID", async (req, res) => {
      const id = req.params.ID;
      const filer = { _id: new ObjectId(id) };
      const result = await dbCollection.deleteOne(filer);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("assignment running car toys");
});

app.listen(port, () => {
  console.log(`assignment port= ${port}`);
});
