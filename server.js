const express = require("express");
const secret = require("./secret.json")

const app = express();
// const bodyParser = require("body-parser");
// app.use(bodyParser.json());
app.use(express.json());




const { Pool } = require('pg');

const pool = new Pool(secret);

app.get("/", function (req, res) {
    res.send("Hello World!");
});

app.get("/hotels", function (req, res) {
    pool.query('SELECT * FROM hotels', (error, result) => {
        if (result) {
            res.json(result.rows);
        } else {
            res.status(404).send({ error: error.message });
        }
    })
})

app.post("/hotels", function (req, res) {
    const newHotelName = req.body.name;
    const newHotelRooms = req.body.rooms;
    const newHotelPostcode = req.body.postcode;

    if (!Number.isInteger(newHotelRooms) || newHotelRooms <= 0) {
        return res
            .status(400)
            .send("The number of rooms should be a positive integer.");
    }

    pool
        .query("SELECT * FROM hotels WHERE name=$1", [newHotelName])
        .then((result) => {
            if (result.rows.length > 0) {
                return res
                    .status(400)
                    .send("An hotel with the same name already exists!");
            } else {
                const query =
                    "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)";
                pool
                    .query(query, [newHotelName, newHotelRooms, newHotelPostcode])
                    .then(() => res.send("Hotel created!"))
                    .catch((e) => console.error(e));
            }
        });
});

app.get("/customers", function (req, res) {
    pool.query('SELECT * FROM customers', (error, result) => {
        if (result) {
            res.json(result.rows);
        } else {
            res.status(404).send({ error: error.message });
        }
    })
})

app.post("/customers", function (req, res) {
    console.log(req.body);
    const { name, email, address, city, postcode, country } = req.body;
    pool
        .query("SELECT * FROM customers WHERE name=$1", [name])
        .then((result) => {
            if (result.rows.length > 0) {
                return res
                    .status(400)
                    .send("A customer with the same name already exists!");
            } else {
                const query =
                    "INSERT INTO customers (name, email, address, city, postcode, country) VALUES ($1, $2, $3, $4, $5, $6)";
                pool
                    .query(query, [name, email, address, city, postcode, country])
                    .then(() => res.send("Customer created!"))
                    .catch((e) => console.error(e));
            }
        });
});

// {
//     "name": "Artur",
//     "email": "someemail@gmail.com",
//     "address": "Carrer Any 32",
//     "city": "Barcelona",
//     "postcode": "08036",
//     "country": "ES"
// }

// set port, listen for requests
app.listen(3000, function () {
    console.log("Server is listening on port 3000. Ready to accept requests!");
});