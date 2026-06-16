const express = require('express');
const eventRouter = express.Router()
const {AddEvent, getAllEventByUser, deleteEvent, updateEvent, getRecentEventsByUser, getRecentvents, getAllEventsForAdmin} = require("../controller/events/event")
const { connectToEventByCode } = require("../controller/events/connectToEvent")
const authenticateToken = require('../middleware/authmiddlewre');
const upload = require("../middleware/upload")
const verifyUserEvent = require("../middleware/verifyuser")

/**
 * @swagger
 * /api/event/addEvent:
 *   post:
 *     summary: Ajouter un événement
 *     tags: [Event]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               DateDebut:
 *                 type: string
 *                 format: date
 *               DateFin:
 *                 type: string
 *                 format: date
 *               heureDebut:
 *                 type: string
 *               heureFin:
 *                 type: string
 *               lieu:
 *                 type: string
 *               categorie:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Événement ajouté
 *       400:
 *         description: Paramètres manquants ou invalides
 */
eventRouter.route("/addEvent").post(upload.single('image'), AddEvent)

/**
 * @swagger
 * /api/event/getAllEventByUser/{id}:
 *   get:
 *     summary: Récupérer tous les événements d'un utilisateur
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des événements
 *       404:
 *         description: Utilisateur non trouvé
 */
eventRouter.route("/getAllEventByUser/:id").get(authenticateToken, getAllEventByUser)

/**
 * @swagger
 * /api/event/getRecentEventsByUser/{id}:
 *   get:
 *     summary: Récupérer les événements récents d'un utilisateur
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des événements récents
 *       404:
 *         description: Utilisateur non trouvé
 */
eventRouter.route("/getRecentEventsByUser/:id").get( getRecentEventsByUser)

/**
 * @swagger
 * /api/event/getRecentvents:
 *   get:
 *     summary: Récupérer les événements récents
 *     tags: [Event]
 *     responses:
 *       200:
 *         description: Liste des événements récents
 */
eventRouter.route("/getRecentvents").get(getRecentvents)

/**
 * @swagger
 * /api/event/connect:
 *   post:
 *     summary: Se connecter à un événement avec son code
 *     tags: [Event]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               EventCode:
 *                 type: string
 *                 description: Code de l'événement
 *             required:
 *               - EventCode
 *     responses:
 *       200:
 *         description: Événement trouvé
 *       400:
 *         description: Code manquant
 *       404:
 *         description: Événement introuvable
 */
eventRouter.route("/connect").post(connectToEventByCode)

/**
 * @swagger
 * /api/event/admin/getAllEvents:
 *   get:
 *     summary: Récupérer tous les événements (admin)
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de tous les événements
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès interdit
 *       500:
 *         description: Erreur serveur
 */
eventRouter.route("/admin/getAllEvents").get(authenticateToken, getAllEventsForAdmin)

/**
 * @swagger
 * /api/event/deleteEvent/{id}:
 *   delete:
 *     summary: Supprimer un événement
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'événement
 *     responses:
 *       200:
 *         description: Événement supprimé
 *       404:
 *         description: Événement non trouvé
 */
eventRouter.route("/deleteEvent/:id").delete(authenticateToken, deleteEvent)

/**
 * @swagger
 * /api/event/updateEvent/{id}:
 *   put:
 *     summary: Mettre à jour un événement
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Événement mis à jour
 */
eventRouter.route("/updateEvent/:id").put(authenticateToken, updateEvent)

module.exports = eventRouter