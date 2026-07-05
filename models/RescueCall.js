const mongoose = require("mongoose");

const rescueCallSchema = new mongoose.Schema(
{
    caseId:{
        type:String,
        required:true,
        unique:true
    },

    animal:{
        type:String,
        required:true
    },

    callerName:{
        type:String,
        required:true
    },

    mobile:{
        type:String,
        required:true
    },

    location:{
        type:String,
        required:true
    },

    description:{
        type:String,
        required:true
    },

    priority:{
        type:String,
        enum:["Low","Medium","High","Critical"],
        default:"Medium"
    },

    status:{
        type:String,
        enum:["Pending","Assigned","Completed"],
        default:"Pending"
    },

    assignedDriver:{
        type:String,
        default:"Not Assigned"
    },

    // Driver Workflow

    startTime:{
        type:String,
        default:""
    },

    reachedTime:{
        type:String,
        default:""
    },

    callResult:{
        type:String,
        default:""
    },

    treatmentRemark:{
        type:String,
        default:""
    },

    finalRemark:{
        type:String,
        default:""
    },

    // Bike KM Details

    startKM:{
        type:Number,
        default:0
    },

    endKM:{
        type:Number,
        default:0
    },

    totalKM:{
        type:Number,
        default:0
    }

},
{
    timestamps:true
});

module.exports = mongoose.model("RescueCall", rescueCallSchema);