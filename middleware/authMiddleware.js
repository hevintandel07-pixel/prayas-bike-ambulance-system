const isLoggedIn = (req, res, next) => {

    if (!req.session.user) {
        return res.redirect("/");
    }

    next();

};

const isAdmin = (req, res, next) => {

    if (!req.session.user) {
        return res.redirect("/");
    }

    if (req.session.user.role !== "admin") {
        return res.redirect("/driver-dashboard");
    }

    next();

};

const isDriver = (req, res, next) => {

    if (!req.session.user) {
        return res.redirect("/");
    }

    if (req.session.user.role !== "driver") {
        return res.redirect("/dashboard");
    }

    next();

};

module.exports = {
    isLoggedIn,
    isAdmin,
    isDriver
};