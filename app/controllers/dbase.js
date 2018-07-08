var Datastore = require('nedb');
const COMPACT = 60000;
var db = {};
    db.templates = new Datastore({ filename: '.db/nedb/templates', autoload: true, multi: false });
    db.settings = new Datastore({ filename: '.db/nedb/settings', autoload: true , multi: false});

db.templates.persistence.setAutocompactionInterval(COMPACT);
db.settings.persistence.setAutocompactionInterval(COMPACT);

module.exports = db;
