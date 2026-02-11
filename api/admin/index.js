const handler = require('./[...path]');

module.exports = async (req, res) => {
    return handler(req, res);
};
