const express = require("express");
const app = express();
const ObjectId = require("mongodb").ObjectId;
app.use(express.json());
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
app.use(cors());
require("dotenv").config();
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z45ex.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("doctorAppointment&Shop");
    const patients = database.collection("patients");
    const doctors = database.collection("doctors");
    const allProducts = database.collection("allProducts");
    const orderCart = database.collection("orderCart");
    const saveUsers = database.collection("saveUsers");
    console.log("connected database");

    // post patients collections
    app.post("/postAllPatients", async (req, res) => {
      const patientsCollection = req.body;
      const result = await patients.insertOne(patientsCollection);
      res.send(result);
    });

    // your bookings
    app.get("/yourBookings/:email", async (req, res) => {
      const query = { email: req.params.email };
      const result = await patients.find(query).toArray();
      res.send(result);
    });

    // get all bookings
    app.get("/allBookings", async (req, res) => {
      const result = await patients.find({}).toArray();
      res.send(result);
    });

    // delete my serial
    app.delete("/deleteMySerial/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await patients.deleteOne(query);
      res.send(result);
    });

    // add  products
    app.post("/addProduct", async (req, res) => {
      const name = req.body.name;
      const rating = req.body.rating;
      const price = req.body.price;
      const discountPrice = req.body.discountPrice;
      const discount = req.body.discount;
      const description = req.body.description;
      const picture = req.files.image;
      const pictureData = picture.data;
      const encodedPicture = pictureData.toString("base64");
      const imageBuffer = Buffer.from(encodedPicture, "base64");
      const product = {
        name,
        rating,
        price,
        discountPrice,
        discount,
        description,
        image: imageBuffer,
      };
      const result = await allProducts.insertOne(product);
      res.send(result);
    });

    // get products
    app.get("/getProductCart", async (req, res) => {
      const result = await allProducts.find({}).toArray();
      res.send(result);
    });

    //  get product with pagination
    app.get("/getProducts", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const counts = await allProducts.count();

      if (page) {
        product = await allProducts
          .find({})
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        product = await allProducts.find({}).limit(size).toArray();
      }
      res.send({ product, counts });
    });

    // find products
    app.get("/findProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await allProducts.findOne(query);
      res.send(result);
    });

    //  update Product
    app.put("/updateProduct/:id", async (req, res) => {
      const id = req.params.id;
      const updateInfo = req.body;
      console.log(updateInfo);
      const query = { _id: ObjectId(id) };
      const result = await allProducts.updateOne(query, {
        $set: {
          name: updateInfo.name,
          description: updateInfo.description,
          discount: updateInfo.discount,
          discountPrice: updateInfo.discountPrice,
          price: updateInfo.price,
          rating: updateInfo.rating,
        },
      });

      res.send(result);
    });

    // delete products
    app.delete("/deleteProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await allProducts.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    // add a new doctor
    app.post("/addDoctor", async (req, res) => {
      const name = req.body.name;
      const email = req.body.email;
      const jobTittle = req.body.jobTittle;
      const age = req.body.age;
      const address = req.body.address;
      const phone = req.body.phone;
      const img = req.body.image;
      const doctor = {
        name,
        email,
        jobTittle,
        age,
        address,
        phone,
        img,
      };
      const result = await doctors.insertOne(doctor);
      res.send(result);
    });

    // get doctors
    app.get("/getDoctors", async (req, res) => {
      const result = await doctors.find({}).toArray();
      res.send(result);
    });

    // get single doctor
    app.get("/singleDoctor/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await doctors.findOne(query);
      res.send(result);
    });

    // delete patient
    app.delete("/deletePatient/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await patients.deleteOne(query);
      res.send(result);
    });

    //  update happy patients
    app.put("/updatePatient/:id", async (req, res) => {
      const id = req.params.id;
      const updateInfo = req.body;
      console.log(updateInfo);
      const query = { _id: ObjectId(id) };
      const result = await patients.updateOne(query, {
        $set: {
          status: updateInfo.status,
        },
      });

      res.send(result);
    });

    // save users
    app.post("/saveUsers", async (req, res) => {
      const user = req.body;
      const result = await saveUsers.insertOne(user);
      res.json(result);
    });

    // make admin
    app.put("/madeAdmin", async (req, res) => {
      const filter = { email: req.body.email };
      const result = await saveUsers.find(filter).toArray();
      if (result) {
        const updateUser = await saveUsers.updateOne(filter, {
          $set: {
            role: "admin",
          },
        });
        res.json(updateUser);
      }
    });

    // check admin
    app.get("/checkAdmin/:email", async (req, res) => {
      const email = { email: req.params.email };
      console.log(email);
      const result = await saveUsers.find(email).toArray();
      res.json(result);
    });

    // Create
    app.post("/addCart", async (req,res)=>{
      const query = req.body;
      const result = await orderCart.insertOne(query)
      res.send(result)
    })

    // save cart info details
    //    app.post('/cartSave', async (req, res) => {
    //       const query = req.body

    //        if(query.quantity===0){
    //           result = await orderCart.insertOne(query)
    //        }
    //        else  {
    //         const filter = req.body.id
    //         const increment= query.quantity + 1
    //         const updateDoc = { $set: { quantity:increment.quantity } }
    //         const option = { upsert: true }
    //        result1 = await orderCart.updateOne(filter, updateDoc, option);
    //        }

    //         res.json({result,result1});

    // })
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log("Connected with database", port);
});
