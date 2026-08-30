const express = require('express');
const InvitationRouter = express.Router();
const {
    createInvitations,
    getInvitationsByEvent,
    sendInvitations,
    scheduleSendInvitations,
    deleteInvitation,
    bulkDeleteInvitations,
} = require('../controller/invitations/invitations');

InvitationRouter.route('/createInvitations/:eventId').post(createInvitations);
InvitationRouter.route('/:eventId').get(getInvitationsByEvent);
InvitationRouter.route('/:eventId/send').post(sendInvitations);
InvitationRouter.route('/send-instant').post(sendInvitations);
InvitationRouter.route('/schedule-send').post(scheduleSendInvitations);
InvitationRouter.route('/delete/:id').delete(deleteInvitation);
InvitationRouter.route('/bulk-delete').post(bulkDeleteInvitations);
InvitationRouter.route('/bulk-delete').delete(bulkDeleteInvitations);

module.exports = InvitationRouter;