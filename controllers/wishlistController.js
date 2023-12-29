
const Wishlist = require('../models/wishlistModels');

const wishlist = async(req,res)=>{
    req.session.lastGetRequest = req.originalUrl;
    const userId = req.session.user_id;
    try {
        const userWishlist = await Wishlist.findOne({ user: userId }).populate('items.product');

        const wishlist = userWishlist ? userWishlist.items : [];
      
        res.render('wishlist', { user: req.session.user_id, wishlist });
    } catch(error){
        console.log(error.message);
    }
}


const wishlistAdd = async(req,res)=>{
    try{
        const userId = req.session.user_id;
        const productId = req.query.productId
        let userWishlist = await Wishlist.findOne({user:userId})
        if (!userWishlist) {
            userWishlist = new Wishlist({
                user: userId,
                items: [{ product: productId }],
            });
        }else {
            const existingWishlistItem = userWishlist.items.find((item) => item.product.toString() === productId);

            if (existingWishlistItem) {
                res.redirect(`/shop?productId=${productId}`)
            } else {
                userWishlist.items.push({ product: productId });
            }
        }

        await userWishlist.save();
        res.redirect('/wishlist');
    }catch(error){
        console.log(error.message);
    }
}

const removeFrom = async(req,res)=>{
try{
  const userId = req.session.user_id;
  const productId = req.query.productId;
  const existingCart = await Wishlist.findOne({user:userId})
  if(existingCart){
  const updatedItems = existingCart.items.filter(
  (item)=> item.product.toString() !== productId
  );
  existingCart.items = updatedItems;
  await existingCart.save();

  res.json({ success: true });
  }else{
    res.status(400).json({success:false,message:'whislist not found'})
  }
}catch(error){
console.log(error.message);
}
}

module.exports = {
    wishlist,
    wishlistAdd,
    removeFrom,
}