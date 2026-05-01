const mongoose = require("mongoose")

//connexion a la base de données mongoDB

async function connecter(url, callback){
    try {

        await mongoose.connect(url)
        callback()

    } catch (error) {
        callback(error)
    }
}

//fonction pour fermer la connexion a mongoDB
function closeConnection(){
    mongoose.connection.close()
}

module.exports = {connecter, closeConnection}