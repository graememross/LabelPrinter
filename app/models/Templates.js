var mongoose = require("mongoose");

var Templates = mongoose.model("Templates", {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    template: String
});

module.exports = Templates;
