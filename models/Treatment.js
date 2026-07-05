const mongoose = require("mongoose");

const treatmentSchema = new mongoose.Schema(
{
    treatmentId:{
        type:String,
        required:true,
        unique:true
    },

    animal:{
        type:String,
        required:true
    },

    doctor:{
        type:String,
        required:true
    },

    treatment:{
        type:String,
        required:true
    },

    medicine:{
        type:String,
        required:true
    },

    status:{
        type:String,
        enum:["Under Treatment","Recovered","Critical"],
        default:"Under Treatment"
    }

},
{
    timestamps:true
});

module.exports = mongoose.model("Treatment", treatmentSchema);