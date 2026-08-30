const express = require('express');
const rsvpRouter = express.Router();
const {
  getGuestRsvpDetails,
  confirmGuestPresence,
  declineGuestPresence,
} = require('../controller/invitations/rsvpController');

rsvpRouter.get('/:token', getGuestRsvpDetails);
rsvpRouter.post('/:token/confirm', confirmGuestPresence);
rsvpRouter.post('/:token/decline', declineGuestPresence);

module.exports = rsvpRouter;
