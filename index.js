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
    console.log("connected database");

    // post patients collections
    app.post("/postAllPatients", async (req, res) => {
      const patientsCollection = req.body;
      const result = await patients.insertOne(patientsCollection);
      res.send(result);
    });

    // your bookings
    app.get("/yourBookings/:email", async (req,res)=>{
      const query = {email: req.params.email}
      const result = await patients.find(query).toArray()
      res.send(result)
    })

    // get all bookings
    app.get("/allBookings", async (req,res)=>{
      const result = await patients.find({}).toArray()
      res.send(result)
    })
   

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
    app.get("/getProducts", async (req,res)=>{
      const result = await allProducts.find({}).toArray()
      res.send(result)
    })


  // add a new doctor
  app.post("/addDoctor", async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const jobTittle = req.body.jobTittle;
    const age = req.body.age;
    const address = req.body.address;
    const phone = req.body.phone;
    const picture = req.files.image;
    const pictureData = picture.data;
    const encodedPicture = pictureData.toString("base64");
    const imageBuffer = Buffer.from(encodedPicture, "base64");
    const doctor = {
      name,
      email,
      jobTittle,
      age,
      address,
      phone,
      image: imageBuffer,
    };
    const result = await doctors.insertOne(doctor);
    res.send(result);
  });


  // get doctors 
  app.get("/getDoctors", async (req,res)=>{
    const result = await doctors.find({}).toArray()
    res.send(result)
  })


  // get single doctor
  app.get('/singleDoctor/:id', async (req,res)=>{
    const id = req.params.id;
    const query = {_id: ObjectId(id)}
    const result = await doctors.findOne(query)
    res.send(result)
    
})

  // delete patient
app.delete("/deletePatient/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await patients.deleteOne(query);
  res.send(result);
  
});


//  update happy patients
app.put('/updatePatient/:id', async (req,res)=>{
  const id = req.params.id;
  const updateInfo = req.body;
  console.log(updateInfo)
  const query = {_id: ObjectId(id)}
  const result = await patients.updateOne(query,{
      $set: {
          status:updateInfo.status
      }
  })
  
  res.send(result)
})

    


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
