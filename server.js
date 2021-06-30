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
    const hotelNameQuery = req.query.name;
    let query = `SELECT * FROM hotels ORDER BY name`;
    if (hotelNameQuery) {
        query = `SELECT * FROM hotels WHERE name LIKE '%${hotelNameQuery}%' ORDER BY name`;
    }
    pool
        .query(query)
        .then((result) => res.json(result.rows))
        .catch((e) => console.error(e));
});

// app.get("/hotels", function (req, res) {
//     pool.query('SELECT * FROM hotels', (error, result) => {
//         if (result) {
//             res.json(result.rows);
//         } else {
//             res.status(404).send({ error: error.message });
//         }
//     })
// })

app.get("/hotels/:hotelId", function (req, res) {
    const hotelId = req.params.hotelId;

    pool
        .query("SELECT * FROM hotels WHERE id=$1", [hotelId])
        .then((result) => res.json(result.rows))
        .catch((e) => console.error(e));
});


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
                    "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3) RETURNING id as hotelid;";
                pool
                    .query(query, [newHotelName, newHotelRooms, newHotelPostcode])
                    .then((result2) => res.json(result2.rows[0]))
                    .catch((e) => console.error(e));
            }
        });
});

app.get("/customers", function (req, res) {
    pool.query('SELECT * FROM customers ORDER BY name', (error, result) => {
        if (result) {
            res.json(result.rows);
        } else {
            res.status(404).send({ error: error.message });
        }
    })
});

app.get("/customers/:customerId", function (req, res) {
    const customerId = req.params.customerId;

    pool
        .query("SELECT * FROM customers WHERE id=$1", [customerId])
        .then((result) => res.json(result.rows))
        .catch((e) => console.error(e));
});

app.get("/customers/:customerId/bookings", (req, res) => {
    const customerId = req.params.customerId;
    const query =
        `select b.checkin_date, b.nights, h.name, h.postcode from bookings b 
        inner join hotels h on h.id = b.hotel_id 
        inner join customers c on c.id = b.customer_id 
        where customer_id = $1`;

    pool
        .query(query, [customerId])
        .then((result) => res.json(result.rows))
        .catch((e) => console.error(e));
});

app.post("/customers", function (req, res) {
    // console.log(req.body);
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

app.put("/customers/:customerId", function (req, res) {
    const customerId = req.params.customerId;
    const { name, email, address, city, postcode, country } = req.body;
    if (email != "" && email.includes("@")) {
        pool
            .query("UPDATE customers SET name=$1 email=$2 address=$3 city=$4 postcode=$5 country=$6 WHERE id=$7",
                [name, email, address, city, postcode, country, customerId])
            .then(() => res.send(`Customer ${customerId} updated!`))
            .catch((e) => console.error(e));
    } else {
        return res
            .status(400)
            .send("Object is incorrect!");
    }

});

app.patch("/customers/:customerId", function (req, res) {
    const customerId = req.params.customerId;
    const newEmail = req.body.email;
    if (newEmail != "" && newEmail.includes("@")) {
        pool
            .query("UPDATE customers SET email=$1 WHERE id=$2", [newEmail, customerId])
            .then(() => res.send(`Customer ${customerId} updated!`))
            .catch((e) => console.error(e));
    } else {
        return res
            .status(400)
            .send("Email is incorrect!");
    }
});

app.delete("/customers/:customerId", function (req, res) {
    const customerId = req.params.customerId;

    pool
        .query("DELETE FROM customers WHERE id=$1", [customerId])
        .then(() => res.send(`Customer ${customerId} deleted!`))
        .catch((e) => console.error(e));
});

app.delete("/customers/:customerId", function (req, res) {
    const customerId = req.params.customerId;

    pool
        .query("DELETE FROM bookings WHERE customer_id=$1", [customerId])
        .then(() => {
            pool
                .query("DELETE FROM customers WHERE id=$1", [customerId])
                .then(() => res.send(`Customer ${customerId} deleted!`))
                .catch((e) => console.error(e));
        })
        .catch((e) => console.error(e));
});

app.delete("/bookings/:bookingId", function (req, res) {
    const bookingId = req.params.bookingId;

    pool
        .query("DELETE FROM bookings WHERE id=$1", [bookingId])
        .then((result) => res.send(`Booking ${bookingId} deleted!`))
        .catch((e) => console.error(e));
});

// set port, listen for requests
app.listen(3000, function () {
    console.log("Server is listening on port 3000. Ready to accept requests!");
});