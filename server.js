const express = require ("express");
const cors = require ("cors");
const bodyparser = require ("body-parser");
const sqlite3 = require ('sqlite3').verbose();
const PORT = 3000;
const app = express ();

const authRoute = require("./routes/authRoute")
const ExRoute = require ("./routes/ExRoute")
const ArtistRoute = require ("./routes/ArtistRoute")
const ArtRoute = require ("./routes/ArtRoute")



app.use(cors());
app.use(bodyparser.json({limit: "200mb"}));
// app.use("/api/auth", authRoute);
app.listen(PORT, () => console.log(`App running on port: ${PORT}`)); // start the server
app.get('/test', (req, res) => {
    res.json ({ok : true});
});

// TO CONNECT THE DATABASE
const db = new sqlite3.Database("./Art.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error("Error while connecting to the database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
        db.run("PRAGMA busy_timeout = 6000");
        db.run("PRAGMA journal_mode = WAL"); // Allows reads and writes at the same time
    }
});

app.use("/api/auth", authRoute);

app.use("/api/AddExhibition", ExRoute);
app.use("/api/getAllEx",ExRoute)
app.use("/api/updateEx",ExRoute)
app.use("/api/deleteEx",ExRoute)


app.use("/api/AddArtist",ArtistRoute) 
app.use("/api/getAllArtists",ArtistRoute) 
app.use("/api/updateArtist",ArtistRoute) 
app.use("/api/deleteArtist",ArtistRoute)

app.use("/api/AddArt",ArtRoute)



 




module.exports = db;