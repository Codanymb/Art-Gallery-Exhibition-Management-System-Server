const jwt = require ("jsonwebtoken");
const {db} = require ("../database/db");
const bodyParser = require("body-parser");


const ExRegister = async (req, res) => {
   
};

const AddExhibition  = async( req, res) =>{
    const {ex_title,ex_date , ex_space, ex_category,  ex_status} = req.body;
     
    const add_query = "INSERT INTO exhibitions (ex_title,ex_date ,ex_space, ex_category,  ex_status) VALUES (?, ?, ?, ?, ?)";
    db.run(add_query, [ex_title,ex_date ,ex_space, ex_category,  ex_status], function(err){

        if(err){
            console.error('Error inserting into Exhibtion table:',  err.message)
            return res.status(500).json({"msg": "Internal server error", "Statu": false});
        }
        res.status(201).json({"Message" : "Successfully created the Exhibition", "Status": true})

      
    })
}


const getAllEx = (req,res) => {

    const getQuery = "SELECT ex_title, ex_date  , ex_space , ex_category, ex_status FROM exhibitions";
    db.all(getQuery, [], (err,rows) => {
        if (err){
            return res.status(500).json({ error: "Getting all the artists failed", details: err.message})
        };
        return res.status(200).json({ users: rows})
    })
}


const updateEx = (req, res) => {
    const exhibition_id = req.params.exhibition_id;
    const {ex_title,ex_date , ex_space, ex_category, ex_status} = req.body;

    const update_query = `
        UPDATE exhibitions 
        SET ex_title = ?, ex_date = ?, ex_status = ?, ex_category = ?, ex_space=?
        WHERE exhibition_id = ? `;

    db.run(update_query, [ex_title, ex_date, ex_space,ex_category, ex_status, exhibition_id], function(err) {
        if (err) {
            return res.status(500).json({ msg: "Internal server error", error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ msg: "Exhibition not found or no changes made" });
        }

        res.json({ msg: "Exhibition updated successfully", status: true });
    });
};


const deleteEx = (req,res) => {
    const exhibition_id= req.params.exhibition_id;

    const deleteQuery = "DELETE FROM exhibitions WHERE exhibition_id=?";

    db.run(deleteQuery, [exhibition_id], function(err){

      if(err){
        return res.status(500).json({error: "Failed to delete", details: err.message});
      }

      if(this.changes===0){
        return res.status(404).json({message: "Exhibition not found"})
      }

      return res.status(200).json({message: "Exhibition Deleted!"})
    })
}





 module.exports ={
          AddExhibition,getAllEx,updateEx, deleteEx
    }


