const express = require("express");
const app = express();
const stripe = require("stripe")("sk_test_51Jw7VaH3ev5JLZVRhTwDATUMywwLp3A0UEVcRscmayn5E6359TSt8AD05IprzzAcCzviV10jZ0p9488Db1QF5q3F00W4qtWJjG")
const body_parser = require("body-parser")
const ObjectId = require("mongodb").ObjectId;
app.use(express.json());
const cors = require("cors");
app.use(cors());
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
app.use(cors());
app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json())
require("dotenv").config();


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
    const saveCart = database.collection("saveCart");
    const saveUsers = database.collection("saveUsers");
    console.log("connected database");


    
    app.post('/payment',  async (req, res) => {
      
      let query = req.body;
      const price = parseFloat(query.amount.totalPrice)*100
      const id = query.id
      

      try {
        const payment = await stripe.paymentIntents.create({
          amount:price,
          currency: "USD",
          description: "amar company",
          payment_method: id,
          confirm:true
        })
        res.json({
          message: "payment successfully paid",
          success:true
        })
      } catch (error) {
      
        res.json({
          message: "payment failed",
          success:false
        })
      }
 
    })

   




    // post patients collections
    app.post("/postAllPatients", async (req, res) => {
      const patientsCollection = req.body;
      const result = await patients.insertOne(patientsCollection);
      res.send(result);
    });


    // my bookings
    app.get("/yourBookings/:email", async (req, res) => {
      const query = { email: req.params.email };
      const result = await patients.find(query).toArray();
      res.send(result);
    });


    // get all bookings for admin
    app.get("/allBookings", async (req, res) => {
      const result = await patients.find({}).toArray();
      res.send(result);
    });


    // cancel my booking
    app.delete("/deleteMySerial/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await patients.deleteOne(query);
      res.send(result);
    });


    // add  products for shop
    app.post("/addProduct", async (req, res) => {
      const query= req.body;
      const result = await allProducts.insertOne(query);
      res.send(result);
    });


    // get products for shop
    app.get("/getProductCart", async (req, res) => {
      const result = await allProducts.find({}).toArray();
      res.send(result);
    });


    //  get product for pagination
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
      res.send(result);
    });


    // add  new doctor
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


    // get all doctors
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


    //  update patients status
    app.put("/updatePatient/:id", async (req, res) => {
      const id = req.params.id;
      const updateInfo = req.body;
      
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
      const result = await saveUsers.find(email).toArray();
      res.json(result);
    });

   

    // get   cart
      app.get("/getCart/:email", async (req,res)=>{
        const email = { email: req.params.email };
        const result = await saveCart.find(email).toArray();
        res.json(result);
    })


    //  save cart
     app.post("/saveCart", async (req,res)=>{
      const query = req.body
      const result = await saveCart.insertOne(query)
      res.send(result)
    })


    // update cart
    app.put("/updatePQty", async (req,res)=>{
      const filter = {id:req.body.id}
      const check = req.body.type
      console.log(req.body);
      const result = await saveCart.find(filter).toArray();
      const upDoc = result[0].qty
      if (result&&!check) {
        const updateUser = await saveCart.updateOne(filter, {
          $set: {
            qty:upDoc +1
          },
        });
        res.send(updateUser);
      }
      else if(check==="Dec") {
        const updateUser = await saveCart.updateOne(filter, {
          $set: {
            qty:upDoc -1
          },
        });
        res.send(updateUser);
      } 
    })


    // cancel order
    app.delete("/deleteProd/:id", async (req,res)=>{
      const id = req.params.id;
      
      const query = {id:id};
      const result = await saveCart.deleteOne(query)
      res.json(result)

    })


    app.delete("/deleteMany", async (req, res) => {
      const result = await saveCart.deleteMany({ "type": "product" })
      res.send(result)
      
    })


  } finally {
    // await  client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log("Connected with database", port);
});
