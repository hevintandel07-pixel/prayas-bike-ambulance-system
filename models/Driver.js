const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
    {
        driverId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        mobile: { type: String, required: true },
        licenseNo: { type: String, required: true },
        assignedAmbulance: { type: String, required: true },
        status: {
            type: String,
            enum: ["Available", "On Rescue", "Off Duty"],
            default: "Available"
        },
        location: { type: String, required: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);