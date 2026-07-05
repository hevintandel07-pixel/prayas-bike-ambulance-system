const express = require("express");
const User = require("../models/User");

const router = express.Router();

/* ================= LOGIN ================= */

router.post("/login", async (req, res) => {

    try {

        const { username, password, role } = req.body;

        const user = await User.findOne({
            username,
            role,
            isActive: true
        });

        if (!user || user.password !== password) {
            return res.send("Invalid Username or Password");
        }

        req.session.user = {
            id: user._id,
            name: user.name,
            username: user.username,
            role: user.role
        };

        if (user.role === "driver") {
            return res.redirect("/driver-dashboard");
        }

        return res.redirect("/dashboard");

    } catch (err) {

        console.log(err);

        res.send("Login Error");

    }

});

/* ================= LOGOUT ================= */

router.get("/logout", (req, res) => {

    req.session.destroy(() => {
        res.redirect("/");
    });

});

/* ================= CHANGE PASSWORD ================= */

router.get("/change-password", (req, res) => {
    res.render("change-password");
});

router.post("/change-password", async (req, res) => {

    try {

        const {
            username,
            role,
            oldPassword,
            newPassword
        } = req.body;

        const user = await User.findOne({
            username,
            role,
            isActive: true
        });

        if (!user || user.password !== oldPassword) {
            return res.send("Old Password Incorrect");
        }

        user.password = newPassword;

        await user.save();

        res.send("Password Changed Successfully");

    } catch (err) {

        console.log(err);

        res.send("Password Change Error");

    }

});

module.exports = router;