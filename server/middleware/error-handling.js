function errorHandler (err, req, res, next) {
    console.error("Error:", err);
    const status = err.status || 500;
    const message = err.message || "Something went wront on the server.";
    res.status(status).json({error: message});
};

function notFoundHandler (req, res, next) {
    res
    .status(404)
    .json({message: "This route does not exist, check the URL"});

};

module.exports = {
    errorHandler,
    notFoundHandler
}