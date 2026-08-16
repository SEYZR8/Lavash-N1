const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function normalizePhone(value) {
    return String(value || "").replace(/[^\d+]/g, "");
}

function createToken(user) {
    return jwt.sign(
        { id:user.id, role:user.role, phone:user.phone },
        process.env.JWT_SECRET,
        { expiresIn:"30d" }
    );
}

router.post("/register", async (req,res) => {
    try {
        const name = String(req.body.name || "").trim();
        const phone = normalizePhone(req.body.phone);
        const password = String(req.body.password || "");
        if (name.length < 2 || phone.length < 7 || password.length < 6)
            return res.status(400).json({success:false,message:"Ism, telefon va kamida 6 belgili parol kerak."});
        const exists = await db.query("SELECT id FROM users WHERE phone=$1",[phone]);
        if (exists.rows.length) return res.status(409).json({success:false,message:"Bu telefon raqam allaqachon ro‘yxatdan o‘tgan."});
        const hash = await bcrypt.hash(password,12);
        const result = await db.query(
            `INSERT INTO users(name,phone,password_hash) VALUES($1,$2,$3) RETURNING id,name,phone,role,created_at`,
            [name,phone,hash]
        );
        const user=result.rows[0];
        res.status(201).json({success:true,token:createToken(user),user});
    } catch(e) {
        console.error(e);
        res.status(500).json({success:false,message:"Server xatosi."});
    }
});

router.post("/login", async (req,res) => {
    try {
        const phone=normalizePhone(req.body.phone || req.body.login);
        const password=String(req.body.password || "");
        const result=await db.query("SELECT * FROM users WHERE phone=$1",[phone]);
        if (!result.rows.length) return res.status(401).json({success:false,message:"Telefon yoki parol noto‘g‘ri."});
        const user=result.rows[0];
        const valid=await bcrypt.compare(password,user.password_hash || "");
        if (!valid) return res.status(401).json({success:false,message:"Telefon yoki parol noto‘g‘ri."});
        res.json({
            success:true,
            token:createToken(user),
            user:{id:user.id,name:user.name,phone:user.phone,role:user.role,created_at:user.created_at}
        });
    } catch(e) {
        console.error(e);
        res.status(500).json({success:false,message:"Server xatosi."});
    }
});

router.get("/me", requireAuth, async (req,res) => {
    const r=await db.query("SELECT id,name,phone,role,created_at FROM users WHERE id=$1",[req.user.id]);
    if(!r.rows.length) return res.status(404).json({success:false,message:"Foydalanuvchi topilmadi."});
    res.json({success:true,data:r.rows[0]});
});

router.patch("/me", requireAuth, async (req,res) => {
    try {
        const name=String(req.body.name || "").trim();
        const phone=normalizePhone(req.body.phone);
        if(name.length<2 || phone.length<7) return res.status(400).json({success:false,message:"Ma’lumotlar noto‘g‘ri."});
        const exists=await db.query("SELECT id FROM users WHERE phone=$1 AND id<>$2",[phone,req.user.id]);
        if(exists.rows.length) return res.status(409).json({success:false,message:"Bu telefon raqam boshqa akkauntga tegishli."});
        const r=await db.query(
            "UPDATE users SET name=$1,phone=$2 WHERE id=$3 RETURNING id,name,phone,role,created_at",
            [name,phone,req.user.id]
        );
        res.json({success:true,data:r.rows[0]});
    } catch(e) {
        console.error(e);
        res.status(500).json({success:false,message:"Profilni saqlashda xato."});
    }
});

module.exports=router;
