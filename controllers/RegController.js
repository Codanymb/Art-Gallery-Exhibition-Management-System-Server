const jwt = require ("jsonwebtoken");
const {db} = require ("../database/db");
const bodyParser = require("body-parser");


const registerForExhibition = (req, res) => {
    console.log('req.user:', req.user);
    const user_id = req.user.id;
    
    const { exhibition_id, attendees, registration_type } = req.body;

    if (registration_type !== "individual" && registration_type !== "group") {
    return res.status(400).json({ msg: "wrong registration type", status: false});
}

    const checkSpaceQuery = "SELECT ex_space, ex_status FROM exhibitions WHERE exhibition_id = ?" ;
    
    db.get(checkSpaceQuery, [exhibition_id], (err, exhibition) => {

        if (err){
            console.error("Error checking exhibition space:", err);
             return res.status(500).json({ msg: "Server error" })
            }

        if (!exhibition) {
            return res.status(404).json({ msg: "Exhibition not found" })
        }

        if (exhibition.ex_status !== "coming") {
            return res.status(404).json({ msg: "You can no longer register for this exhibition" })
        }
        
         const countQuery = `
            SELECT COALESCE(SUM(attendees), 0) AS total_registered
            FROM registrations
            WHERE exhibition_id = ?
        `; // COALESCE , make sure that if there is no attendess, it returns 0 instead of null
        
        db.get(countQuery, [exhibition_id], (err, result) => {
            if (err) {
                console.error("Error counting registrations:", err);
                return res.status(500).json({ msg: "Server error" })
            };

            const space = exhibition.ex_space - result.total_registered;

            if (attendees > space) {
                return res.status(400).json({ msg: "Not enough space left" });
            }

            // Step 3: Register
            const insertQuery = `
                INSERT INTO registrations (user_id, exhibition_id, attendees, registration_type)
                VALUES (?, ?, ?, ?)
            `;
            db.run(insertQuery, [user_id, exhibition_id, attendees, registration_type], function (err) {
                if (err) {
                    console.error("Error inserting registration:", err);
                    return res.status(500).json({ msg: "Server error" })
                };

                res.status(200).json({ msg: "Registration successful" });
            });
        });
    });
};



const getAllReg = (req, res) => {
    console.log('req.user:', req.user);
    const getQuery = "SELECT *  FROM registrations ";

    db.all(getQuery, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Fetching registrations failed", details: err.message });
        }
        return res.status(200).json({ registrations: rows });
    });
};

const getEachReg = (req, res) => {
    const registration_id = req.params.registration_id;

    const getQuery = "SELECT * FROM registrations WHERE registration_id = ?"

    db.get(getQuery, [registration_id], (err, registration) =>{
        if(err){
            return res.json({"e1": err})
        }
        if(!registration){
            return res.json({"message": "no registration found"})
        }
        return res.json({"registration": registration})
    })
}


 module.exports ={
          registerForExhibition, getAllReg,getEachReg
    }


