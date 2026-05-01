const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const {connecter} = require('./db/connect');
const express = require('express');
const userRouter = require('./routes/user');
const Authrouter = require('./routes/authRoutes');
const eventRouter = require('./routes/event');
const InviteRouter = require('./routes/invites');
const QrRouter = require('./routes/generateQrCode');
const statsRouter = require('./routes/stats');
const cors = require('cors');

require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const InvitationRouter = require('./routes/invitations');
const swaggerSpec = swaggerJsDoc({
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
        },
    },
    apis: ['./routes/*.js'], // path where API docs are located
});

const corsOptions = {
  // Origines autorisées (votre frontend React)
  origin: [
    'http://localhost:5173', // URL de développement
  ],
  
  // Méthodes HTTP autorisées
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // Headers autorisés
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  
  // Headers exposés au frontend
  exposedHeaders: ['X-Total-Count', 'X-Token-Expired'],
  
  // Autoriser les cookies / credentials
  credentials: true,
  
  // Durée de cache de la pré-vol (en secondes)
  maxAge: 86400, // 24 heures
  
  // Code de succès pour les requêtes OPTIONS
  optionsSuccessStatus: 200
};


const app = express()

// Appliquer CORS globalement
app.use(cors(corsOptions));
const port = process.env.PORT || 8000
const url = process.env.MONGO_URI;

//middleware pour parser les données envoyées dans le corps de la requête
app.use(express.json())
app.use(cookieParser());

//middleware pour parser les données envoyées dans le corps de la requête en format urlencoded
// Documentation Swagger accessible à l'URL /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.urlencoded({extended: true}))

//importation des routes
app.use("/api", userRouter);
app.use("/api/auth", Authrouter);
app.use("/api/event", eventRouter);
app.use("/api/invite", InviteRouter);
app.use("/api/qrcode", QrRouter);
app.use("/api/invitations", InvitationRouter);
app.use("/api/user", statsRouter);

//connexion a la BD
connecter(url, (error)=>{
    if(error){
        console.log("erreur de connexion a mongoDB", error);
        process.exit(-1)
    }else{
        console.log("connexion a mongoDB reussit !")
        app.listen({port},()=>{
            console.log(`server is running on port ${port}`);
        })
    }
})
