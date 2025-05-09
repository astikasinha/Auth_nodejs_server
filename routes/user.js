const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const user_jwt = require('../middleware/user_jwt');  // JWT middleware

// GET authenticated user
router.get('/', user_jwt, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            user: user
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
        next(error);
    }
});

// POST register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({ success: false, msg: 'All fields are required' });
        }

        // Check if user already exists
        let user_exist = await User.findOne({ email });
        if (user_exist) {
            return res.status(400).json({
                success: false,
                msg: 'User already exists'
            });
        }

        // Hash the password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Create and save the new user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            avatar: `https://gravatar.com/avatar/?s=200&d=retro`
        });

        await user.save();

        // JWT token payload
        const payload = {
            user: {
                id: user.id
            }
        };

        // Generate and send the JWT token
        jwt.sign(payload, process.env.jwtUserSecret, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            return res.status(201).json({
                success: true,
                token: token
            });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
});
router.post('/login',async(req,res,next)=>{
    const email=req.body.email;
    const password=req.body.password;
    try{
        let user=await User.findOne({
            email:email
        });
        if(!user){
            res.status(400).json({
                success: false,
                msg: 'User does not exist go and register to continue'
            });
        }
        const isMatch=await bcryptjs.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({
                success:false,
                msg: 'Invalid password'
            });
        }
        const payload={
            user:{
                id:user.id
            }
        }
        jwt.sign(
            payload,process.env.jwtUserSecret,
            {
                expiresIn:360000
            },(err,token)=>{
                if(err)throw err;
                res.status(200).json({
                    success:true,
                    msg: 'User logged in',
                    token: token,
                    user:user
                })
            }
        )
    }
    catch(err){
        console.log(error.message);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        })
    }
});
module.exports = router;
