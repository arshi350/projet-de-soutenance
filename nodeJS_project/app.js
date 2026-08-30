const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { connecter } = require('./db/connect');
const express = require('express');
const userRouter = require('./routes/user');
const Authrouter = require('./routes/authRoutes');
const eventRouter = require('./routes/event');
const InviteRouter = require('./routes/invites');
const QrRouter = require('./routes/generateQrCode');
const statsRouter = require('./routes/stats');
const adminStatsRouter = require('./routes/adminStats');
const templatesRouter = require('./routes/templates');
const InvitationRouter = require('./routes/invitations');
const notificationRouter = require('./routes/notification');
const scanRouter = require('./routes/scan');
const rsvpRouter = require('./routes/rsvpRoutes');
const cors = require('cors');

const { startStatusScheduler } = require('./services/eventStatusScheduler');
const { startDailyReminderScheduler } = require('./services/dailyReminderScheduler');
const { startInvitationScheduler } = require('./services/invitationSchedulerService');

require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerSpec = swaggerJsDoc({
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
        },
    },
    apis: ['./routes/*.js'],
});

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-refresh-token',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Token-Expired', 'X-New-Access-Token'],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 200
};

const app = express();

app.use(cors(corsOptions));
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const port = process.env.PORT || 8000;
const url = process.env.MONGO_URI;

app.use(express.json({ limit: '25mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const publicTicketsRouter = require('./routes/publicTickets');
const aiRouter = require('./routes/aiRoutes');
const socialRouter = require('./routes/socialRoutes');
const pollRouter = require('./routes/pollRoutes');
const reminderRouter = require('./routes/reminderRoutes');
const feedbackRouter = require('./routes/feedbackRoutes');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Montage des routes principales
app.use("/api", userRouter);
app.use("/api/auth", Authrouter);
app.use("/api/event", eventRouter);
app.use("/api/public", publicTicketsRouter);
app.use("/api/invite", InviteRouter);
app.use('/api/scan', scanRouter);
app.use("/api/qrcode", QrRouter);
app.use("/api/invitations", InvitationRouter);
app.use("/api/rsvp", rsvpRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/user", statsRouter);
app.use("/api", adminStatsRouter);
app.use("/api/templates", templatesRouter);
app.use("/api/ai", aiRouter);
app.use("/api/social", socialRouter);
app.use("/api/polls", pollRouter);
app.use("/api/reminders", reminderRouter);
app.use("/api/feedback", feedbackRouter);

// Connexion à la base de données
connecter(url, (error) => {
    if (error) {
        console.log("Erreur de connexion à MongoDB", error);
        process.exit(-1);
    } else {
        console.log("Connexion à MongoDB réussie !");
        // Démarrer les planificateurs et crons automatiques
        startStatusScheduler();
        startDailyReminderScheduler();
        startInvitationScheduler();

        app.listen(port, () => {
            console.log(`🚀 Serveur démarré sur le port ${port}`);
        });
    }
});