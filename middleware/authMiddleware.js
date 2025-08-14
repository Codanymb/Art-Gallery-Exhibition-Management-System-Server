const jwt = require("jsonwebtoken");

const authenticatedUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ "msg": "Not authorized, Only Customers allowed" });
    }

    const token = authHeader.split(' ')[1]; // Extract the token part after "Bearer"

    try {
        const user = jwt.verify(token, "private_key");
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ "msg": error.message });
    }
};

const owner = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ "msg": "Not authorized, Only Owner allowed" });
    }

    const token = authHeader.split(' ')[1]; // Extract the token part after "Bearer"

    try {
        const user = jwt.verify(token, "private_key");
        
          if (user.user_type !== "owner") {
            return res.status(403).json({ msg: "Only The Gallery Owners can access this route" });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ "msg": error.message });
    }
};



const Clerk = (req,res,next)=>{
    
    if(!req.headers.token) return res.json({"msg3":"Not authorized, Only Clerk allowed"});
    const header_token = req.headers.token;

    try {
       const user = jwt.verify(header_token, "private_key");
       console.log("USER: ",user);
       
       if(user.user_type == "clerk"){
           req.user = user;
           next();
        }
        else{
            return res.json({"msg2": "Only The Clerk can access"});  
        }
    } catch (error) {
        return res.json({"msg2":error.message});
    }
}



module.exports = {
    authenticatedUser, owner,Clerk
};
