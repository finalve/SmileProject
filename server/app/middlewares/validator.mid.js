validateReqBody = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length) {
            return res.status(400).json({ error: `Missing fields: ${missingFields.join(', ')}` });
        }
        next();
    }
};

const restricted = {
    validateReqBody
};
module.exports = restricted;