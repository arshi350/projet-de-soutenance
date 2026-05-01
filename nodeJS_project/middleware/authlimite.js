const rateLimit = require("express-rate-limit")

const authLimiter = rateLimit({
    windowsMs: 15 * 60 * 1000, //15 minutes
    limit:3, //limite de 3 requetes par IP
    message: "trop de tentatives de connexion, essayez a nouveau dans 15 minutes",
    skypSuccessful: true, //ne compte pas les requetes reussites
    standardHeaders: true, //renvoie les informations de limite dans les en-têtes de réponse
    legacyHeaders: false, //désactive les en-têtes de réponse obsolètes
})

module.exports = authLimiter