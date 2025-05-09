const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Extract token from Authorization header
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({
            msg: 'No token, authorization denied'
        });
    }

    try {
        // Verify and decode token
        const decoded = jwt.verify(token, process.env.jwtUserSecret);

        // Attach user info to the request object
        req.user = decoded.user;
        next();  // Proceed to the next middleware/route handler
    } catch (err) {
        console.error('Error with JWT middleware: ', err);
        res.status(500).json({
            msg: 'Server error'
        });
    }
};
