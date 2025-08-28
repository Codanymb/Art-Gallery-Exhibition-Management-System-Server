const { db } = require("../database/db")

const createCart = (req, res) => {
    const user_id = req.user.id;
    
    if (!user_id) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const cart_query = "SELECT * FROM cart WHERE user_id = ?";

    db.get(cart_query, [user_id], (err, existingCart) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        if (existingCart) {
            return res.status(200).json({ message: "Cart already exists", cart_id: existingCart.cart_id });
        }

        const add_query = "INSERT INTO cart (user_id) VALUES (?)";

        db.run(add_query, [user_id], function (err) {
            if (err) {
                return res.status(500).json({ error: "Failed to create cart", details: err.message });
            }

            res.status(201).json({ message: "Cart created", cart_id: this.lastID });
        });
    });
};

const addToCart = (req, res) => {
    const user_id = req.user.id;
    const {art_piece_id, quantity,price} = req.body;

    if(!user_id || !art_piece_id || quantity <=0){
        return res.status(400).json({Error: "There is an error"})
    }

    const checkCartQuery = "SELECT cart_id FROM Cart WHERE user_id = ?";
    db.get(checkCartQuery, [ user_id], (err, cart) => {

         if(err){
        return res.status(500).json({Error: "Error with the database or server", details: err.message})
    };

    if(!cart){
        return res.status(404).json({error: "No cart exist"})
    }

    const checkArtQuery = "SELECT  *  FROM cart_items WHERE art_piece_id =? AND cart_id = ?" ;
    db.get(checkArtQuery, [art_piece_id,cart.cart_id], (err,item) =>{
        if(err){
            return res.status(500).json({Error: "Error with the datbase or server", details: err.message});

        }
        if(item){
            const quant = Number( item.quantity) +Number(quantity);

            const updateQuery = "UPDATE cart_items SET quantity =?  WHERE cart_item_id=?";

             db.run(updateQuery, [quant, item.cart_item_id], function (err) {
                    if (err) return res.status(500).json({ error: "Update failed", details: err.message });
                    res.json({ message: "Item quantity updated well", cart_item_id: item.cart_item_id });
                });
        }else{
            const insertQuery = "INSERT INTO cart_items (cart_id, art_piece_id, quantity,price) VALUES (?, ?, ?, ?)";
            db.run(insertQuery, [cart.cart_id, art_piece_id, quantity, price], function (err) {
                    if (err) return res.status(500).json({ error: "Insert failed", details: err.message });
                    res.status(201).json({ message: "Item added to cart", art_piece_id: this.lastID });
                });

                    
        };

    } );
        
    });
   
};

const removeFromCart = (req,res) => {
    const {art_piece_id} = req.body;
    const user_id = req.user.id;

    
        if(!art_piece_id){
            return res.status(400).json({Error: "No art piece"})
        }

    const checkQuery = "SELECT cart_id FROM cart WHERE user_id =? "
    db.get(checkQuery, [ user_id], (err, cart) =>
        {
            if(err){
                return res.status(500).json({err: "database error", Message: err.message});
            }
            
            if(!cart){
                return res.status(404).json({error: "Cart not found"});
            }

            
            const checkArtQuery = "SELECT * FROM cart_items WHERE cart_id =? AND art_piece_id =? "
            db.get(checkArtQuery, [cart.cart_id, art_piece_id], (err, art) =>{
                if(err){
                    return res.status(500).json({error: "Database error", details: err.message})
                }
                if(!art){
                    return res.status(404).json({Error: "No art found"});
                }
                
            const deleteQuery = "DELETE FROM cart_items WHERE art_piece_id = ? ";
             db.run(deleteQuery, [art.art_piece_id], function(err){
                  if(err){
                     return res.status(500).json({error: "Database error", details: err.message})
                  }
                    return res.status(200).json({message: "Successfully deleted the art_piece", art_piece_id: art.art_piece_id})
        });
            })

          

    });
};

const viewCart = (req, res) =>{
    const user_id = req.user.id
    
    const checkCartQuery = "SELECT cart_id FROM cart WHERE user_id =? ";
    db.get(checkCartQuery, [user_id], (err, cart) =>{

         if(err){
                return res.status(500).json({error: "Something wrong wwith db", details: err.message});
            }

        if(!cart){
            return res.status(404).json({error: "no carts found"})
        }

        // retrieve these specific columns from the two tables
        //Join each row in CartItems with the matching row in art pieces, where their art_pieces_id values are the same
        const itemsQuery = " SELECT  ci.cart_item_id, ci.quantity, c.art_piece_id,  c.title, c.description FROM cart_items ci JOIN art_pieces c ON ci.art_piece_id = c.art_piece_id WHERE ci.cart_id = ? ";

        db.all(itemsQuery, [ cart.cart_id], (err, items) => {
            if(err){
                return res.status(500).json({Error: "Something wrong with db", details: err.message});
            }
            return res.status(200).json({
                cart_id: cart.cart_id,
                items:items
            });
              });
           
    });

};

const checkOut = (req, res) => {
    const user_id = req.user.id; 
    const { order_type, delivery_address } = req.body;

    if (!['pickup', 'delivery'].includes(order_type)) {
        return res.status(400).json({ error: "Invalid order type. Must be 'pickup' or 'delivery'." });
    }

    if (order_type === 'delivery' && !delivery_address) {
        return res.status(400).json({ error: "Delivery address is required for delivery orders." });
    }

    //Find user's active cart
    const cartQuery = "SELECT cart_id FROM cart WHERE user_id = ?";
    db.get(cartQuery, [user_id], (err, cart) => {
        if (err) return res.status(500).json({ error: "Database error", details: err.message });

        if (!cart) return res.status(404).json({ error: "No active cart found. Please add items first." });

        const cart_id = cart.cart_id;

        // Retrieve all items in the cart and their stock
        const itemQuery = `
            SELECT 
                ci.art_piece_id, 
                ci.quantity AS requested_quantity, 
                ci.price, 
                ap.quantity AS available_quantity
            FROM cart_items ci
            JOIN art_pieces ap ON ci.art_piece_id = ap.art_piece_id
            WHERE ci.cart_id = ?
        `;

        db.all(itemQuery, [cart_id], (err, items) => {
            if (err) return res.status(500).json({ error: "Failed to retrieve cart items", details: err.message });

            if (items.length === 0) return res.status(400).json({ error: "Your cart is empty." });

            // Check if enough stock is available for each item
            for (let item of items) {
                if (item.requested_quantity > item.available_quantity) {
                    return res.status(400).json({
                        error: `Not enough stock for art piece ${item.art_piece_id}`,
                        requested: item.requested_quantity,
                        available: item.available_quantity
                    });
                }
            }

            const totalAmount = items.reduce(
                (sum, item) => sum + (item.price * item.requested_quantity),
                0
            );

            const orderQuery = `
                INSERT INTO orders (user_id, order_type, delivery_address, total_amount)
                VALUES (?, ?, ?, ?)
            `;
            db.run(
                orderQuery,
                [user_id, order_type, order_type === 'pickup' ? null : delivery_address, totalAmount],
                function (err) {
                    if (err) return res.status(500).json({ error: "Failed to create order", details: err.message });

                    const order_id = this.lastID; 

                    const insertOrderItem = db.prepare(`
                        INSERT INTO order_items (order_id, art_piece_id, quantity, price)
                        VALUES (?, ?, ?, ?)
                    `);
                    const updateQuantity = db.prepare(`
                        UPDATE art_pieces SET quantity = quantity - ? WHERE art_piece_id = ?
                    `);

                    for (let item of items) {
                        // Insert the ordered item into order_items
                        insertOrderItem.run(order_id, item.art_piece_id, item.requested_quantity, item.price);
                        // Update the quantity in art_pieces (deduct stock)
                        updateQuantity.run(item.requested_quantity, item.art_piece_id);
                    }

                    insertOrderItem.finalize();
                    updateQuantity.finalize();

                    const clearCart = "DELETE FROM cart_items WHERE cart_id = ?";
                    db.run(clearCart, [cart_id], (err) => {
                        if (err) {
                            return res.status(500).json({ error: "Failed to clear cart", details: err.message });
                        }

                        return res.status(200).json({
                            message: "Order placed successfully.",
                            order_id,
                            total_amount: totalAmount
                        });
                    });
                }
            );
        });
    });
};


module.exports = {
    createCart,addToCart,removeFromCart,viewCart, checkOut
}