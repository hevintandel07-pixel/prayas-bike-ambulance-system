const User = require("../models/User");

// Create Default Admin & Driver (Only First Time)

const seedUsers = async () => {
    try {

        const adminExists = await User.findOne({
            username: "admin"
        });

        if (!adminExists) {

            await User.create({
                name: "Administrator",
                username: "admin",
                password: "admin123",
                role: "admin"
            });

            console.log("✅ Default Admin Created");
        }

        const driverExists = await User.findOne({
            username: "driver"
        });

        if (!driverExists) {

            await User.create({
                name: "Driver",
                username: "driver",
                password: "driver123",
                role: "driver"
            });

            console.log("✅ Default Driver Created");
        }

    } catch (err) {

        console.log(err.message);

    }
};

module.exports = {
    seedUsers
};