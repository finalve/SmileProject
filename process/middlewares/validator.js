validateReqBody = (requiredFields) => {
    return (req, next) => {
        const missingFields = requiredFields.filter(field => !req[field]);
        if (missingFields.length) {
            return console.log(`Missing fields: ${missingFields.join(', ')}`);
        }
        next();
    }
};

module.exports = validateReqBody;