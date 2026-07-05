const express = require("express");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const User = require("./models/User");
const Driver = require("./models/Driver");
const Ambulance = require("./models/Ambulance");
const RescueCall = require("./models/RescueCall");
const Treatment = require("./models/Treatment");
const { seedUsers } = require("./controllers/authController");
const { isAdmin, isDriver } = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: "prayas-bike-ambulance-secret",
    resave: false,
    saveUninitialized: false
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const { username, password, role } = req.body;
    const user = await User.findOne({ username, role, isActive: true });

    if (!user || user.password !== password) {
        return res.send("Invalid Username or Password");
    }

    req.session.user = {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role
    };

    if (user.role === "driver") return res.redirect("/driver-dashboard");

    res.redirect("/dashboard");
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/"));
});

app.get("/change-password", (req, res) => {
    res.render("change-password");
});

app.post("/change-password", async (req, res) => {
    const { username, role, oldPassword, newPassword } = req.body;
    const user = await User.findOne({ username, role, isActive: true });

    if (!user || user.password !== oldPassword) {
        return res.send("Old Password Incorrect");
    }

    user.password = newPassword;
    await user.save();

    res.redirect("/");
});

/* ADMIN ROUTES */

app.get("/dashboard", isAdmin, async (req, res) => {

    const totalDrivers = await Driver.countDocuments();
    const totalAmbulances = await Ambulance.countDocuments();
    const totalCalls = await RescueCall.countDocuments();
    const totalTreatments = await Treatment.countDocuments();

    const availableDrivers = await Driver.countDocuments({
        status: "Available"
    });

    const availableAmbulances = await Ambulance.countDocuments({
        status: "Available"
    });

    const pendingCalls = await RescueCall.countDocuments({
        status: "Pending"
    });

    res.render("admin/dashboard", {
        currentPage: "dashboard",
        totalDrivers,
        totalAmbulances,
        totalCalls,
        totalTreatments,
        availableDrivers,
        availableAmbulances,
        pendingCalls
    });

});

app.get("/ambulance", isAdmin, async (req, res) => {
    const ambulances = await Ambulance.find().sort({ createdAt: -1 });

    res.render("admin/ambulance", {
        currentPage: "ambulance",
        ambulances
    });
});

app.post("/ambulance/add", isAdmin, async (req, res) => {
    await Ambulance.create(req.body);
    res.redirect("/ambulance");
});

app.post("/ambulance/update/:id", isAdmin, async (req, res) => {
    await Ambulance.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/ambulance");
});

app.get("/ambulance/delete/:id", isAdmin, async (req, res) => {
    await Ambulance.findByIdAndDelete(req.params.id);
    res.redirect("/ambulance");
});

app.get("/drivers", isAdmin, async (req, res) => {

    const drivers = await Driver.find().sort({ createdAt: -1 });

    const ambulances = await Ambulance.find().sort({
        ambulanceId: 1
    });

    res.render("admin/drivers", {
        currentPage: "drivers",
        drivers,
        ambulances
    });

});

app.post("/drivers/add", isAdmin, async (req, res) => {

    try {

        const driver = await Driver.create(req.body);

        const userExists = await User.findOne({
            username: driver.driverId,
            role: "driver"
        });

        if (!userExists) {
            await User.create({
                name: driver.name,
                username: driver.driverId,
                password: driver.mobile,
                role: "driver",
                isActive: true
            });
        }

        res.redirect("/drivers");

    } catch (error) {

        console.log(error);
        res.send("Driver Add Error");

    }

});

app.post("/drivers/update/:id", isAdmin, async (req, res) => {

    try {

        const oldDriver = await Driver.findById(req.params.id);

        const updatedDriver = await Driver.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        await User.findOneAndUpdate(
            {
                username: oldDriver.driverId,
                role: "driver"
            },
            {
                name: updatedDriver.name,
                username: updatedDriver.driverId,
                password: updatedDriver.mobile,
                role: "driver",
                isActive: true
            },
            {
                upsert: true
            }
        );

        res.redirect("/drivers");

    } catch (error) {

        console.log(error);
        res.send("Driver Update Error");

    }

});
app.get("/drivers/delete/:id", isAdmin, async (req, res) => {

    try {

        const driver = await Driver.findById(req.params.id);

        if (driver) {
            await User.findOneAndDelete({
                username: driver.driverId,
                role: "driver"
            });
        }

        await Driver.findByIdAndDelete(req.params.id);

        res.redirect("/drivers");

    } catch (error) {

        console.log(error);
        res.send("Driver Delete Error");

    }

});

app.get("/new-call", isAdmin, async (req, res) => {

    const rescueCalls = await RescueCall.find().sort({ createdAt: -1 });
    const drivers = await Driver.find().sort({ name: 1 });

    res.render("admin/new-call", {
        currentPage: "new-call",
        rescueCalls,
        drivers
    });

});

app.post("/new-call/add", isAdmin, async (req, res) => {

    try {

        await RescueCall.create(req.body);

        res.redirect("/new-call");

    } catch (error) {

        console.log(error);

        res.send("Rescue Call Add Error");

    }

});


app.get("/treatment", isAdmin, async (req, res) => {

    const treatments = await Treatment.find().sort({ createdAt: -1 });

    res.render("admin/treatment", {
        currentPage: "treatment",
        treatments
    });

});

app.post("/treatment/add", isAdmin, async (req, res) => {

    try {

        await Treatment.create(req.body);

        res.redirect("/treatment");

    } catch (error) {

        console.log(error);

        res.send("Treatment Add Error");

    }

});


app.get("/reports", isAdmin, async (req, res) => {

    const totalDrivers = await Driver.countDocuments();
    const totalAmbulances = await Ambulance.countDocuments();
    const totalCalls = await RescueCall.countDocuments();
    const totalTreatments = await Treatment.countDocuments();

    const completedCalls = await RescueCall.countDocuments({
        status: "Completed"
    });

    const pendingCalls = await RescueCall.countDocuments({
        status: "Pending"
    });

    const assignedCalls = await RescueCall.countDocuments({
        status: "Assigned"
    });

    // Driver Monthly Report
    const drivers = await Driver.find();

    const driverReports = [];

    for (const driver of drivers) {

        const calls = await RescueCall.find({
            assignedDriver: driver.name
        });

        const totalAssigned = calls.length;

        const totalCompleted = calls.filter(call =>
            call.status === "Completed"
        ).length;

        const totalPending = calls.filter(call =>
            call.status === "Pending"
        ).length;

        const totalAssignedRunning = calls.filter(call =>
            call.status === "Assigned"
        ).length;

        const totalKM = calls.reduce((sum, call) => {
            return sum + (call.totalKM || 0);
        }, 0);

        driverReports.push({

            driverName: driver.name,

            ambulance: driver.assignedAmbulance || "-",

            totalAssigned,

            totalCompleted,

            totalPending,

            totalAssignedRunning,

            totalKM

        });

    }

    res.render("admin/reports", {

        currentPage: "reports",

        totalDrivers,
        totalAmbulances,
        totalCalls,
        totalTreatments,

        completedCalls,
        pendingCalls,
        assignedCalls,

        driverReports

    });

});

/* DRIVER ROUTES */

app.get("/driver-dashboard", isDriver, async (req, res) => {

    try {
        const driver = await Driver.findOne({
            driverId: req.session.user.username
        });

        if (!driver) {
            return res.render("driver/driver-dashboard", {
                totalAssigned: 0,
                pendingCallsCount: 0,
                onRescueCount: 0,
                completedCount: 0
            });
        }

        const totalAssigned = await RescueCall.countDocuments({ assignedDriver: driver.name });
        const pendingCallsCount = await RescueCall.countDocuments({ assignedDriver: driver.name, status: "Pending" });
        const onRescueCount = await RescueCall.countDocuments({ assignedDriver: driver.name, status: "Assigned" });
        const completedCount = await RescueCall.countDocuments({ assignedDriver: driver.name, status: "Completed" });

        res.render("driver/driver-dashboard", {
            totalAssigned,
            pendingCallsCount,
            onRescueCount,
            completedCount
        });

    } catch (error) {
        console.log(error);
        res.send("Driver Dashboard Error");
    }

});

app.get("/driver-dashboard", isDriver, async (req, res) => {

    try {

        const driver = await Driver.findOne({
            driverId: req.session.user.username
        });

        if (!driver) {
            return res.render("driver/driver-dashboard", {
                totalAssigned: 0,
                pendingCallsCount: 0,
                onRescueCount: 0,
                completedCount: 0
            });
        }

        const totalAssigned = await RescueCall.countDocuments({
            assignedDriver: driver.name
        });

        const pendingCallsCount = await RescueCall.countDocuments({
            assignedDriver: driver.name,
            status: "Pending"
        });

        const onRescueCount = await RescueCall.countDocuments({
            assignedDriver: driver.name,
            status: "Assigned"
        });

        const completedCount = await RescueCall.countDocuments({
            assignedDriver: driver.name,
            status: "Completed"
        });

        res.render("driver/driver-dashboard", {
            totalAssigned,
            pendingCallsCount,
            onRescueCount,
            completedCount
        });

    } catch (error) {

        console.log(error);
        res.send("Driver Dashboard Error");

    }

});

app.get("/driver-calls", isDriver, async (req, res) => {

    try {
        const driver = await Driver.findOne({
            driverId: req.session.user.username
        });

        if (!driver) {
            return res.render("driver/driver-calls", {
                assignedCalls: []
            });
        }

        const assignedCalls = await RescueCall.find({
            assignedDriver: driver.name
        }).sort({ createdAt: -1 });

        res.render("driver/driver-calls", {
            assignedCalls
        });

    } catch (error) {
        console.log(error);
        res.send("Driver Calls Error");
    }

});

app.get("/driver-call/accept/:id", isDriver, async (req, res) => {

    await RescueCall.findByIdAndUpdate(req.params.id, {
        status: "Assigned"
    });

    res.redirect("/driver-calls");

});

app.get("/driver-workflow/:id", isDriver, async (req, res) => {

    const rescueCall = await RescueCall.findById(req.params.id);

    if (!rescueCall) {
        return res.redirect("/driver-calls");
    }

    res.render("driver/driver-workflow", {
        rescueCall
    });

});

app.post("/driver-workflow/complete/:id", isDriver, async (req, res) => {

    try {

        const startKM = Number(req.body.startKM) || 0;
        const endKM = Number(req.body.endKM) || 0;
        const totalKM = endKM > startKM ? endKM - startKM : 0;

        await RescueCall.findByIdAndUpdate(req.params.id, {
            status: "Completed",

            startTime: req.body.startTime || "",
            reachedTime: req.body.reachedTime || "",
            callResult: req.body.callResult || "",
            treatmentRemark: req.body.treatmentRemark || "",
            finalRemark: req.body.finalRemark || "",

            startKM,
            endKM,
            totalKM
        });

        res.redirect("/driver-calls");

    } catch (error) {

        console.log(error);
        res.send("Workflow Complete Error");

    }

});
app.get("/driver-status", isDriver, async (req, res) => {

    const driver = await Driver.findOne({
        name: req.session.user.name
    });

    if (!driver) {
        return res.redirect("/driver-dashboard");
    }

    res.render("driver/driver-status", {
        driver
    });

});

app.post("/driver-status/update", isDriver, async (req, res) => {

    await Driver.findOneAndUpdate(
        { name: req.session.user.name },
        {
            status: req.body.status,
            location: req.body.location
        }
    );

    res.redirect("/driver-status");

});

app.get("/driver-treatment", isDriver, (req, res) => {
    res.render("driver/driver-treatment", {
        driverName: req.session.user.name
    });
});

app.post("/driver-treatment/add", isDriver, async (req, res) => {
    await Treatment.create(req.body);
    res.redirect("/driver-treatment");
});

const startServer = async () => {
    await connectDB();
    await seedUsers();

    app.listen(PORT, () => {
        console.log(`🚑 Server running on http://localhost:${PORT}`);
    });
};

startServer();