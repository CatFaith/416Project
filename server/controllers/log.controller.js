const db = require("../models");
const Log = db.log;

exports.addLog = async (type, model, method, message, operatorUser) => {
    const newLog = {
        type: type,
        model: model,
        method: method,
        message: message,
        operatorUser: operatorUser
    };
    Log.create(newLog)
};


