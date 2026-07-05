const mongoose = require("mongoose");

const ambulanceSchema = new mongoose.Schema(
    {
        ambulanceId: { type: String, required: true, unique: true },
        vehicleType: { type: String, required: true },
        driverName: { type: String, required: true },
        driverMobile: { type: String, required: true },
        location: { type: String, required: true },
        status: {
            type: String,
            enum: ["Available", "Busy", "Maintenance"],
            default: "Available"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Ambulance", ambulanceSchema);