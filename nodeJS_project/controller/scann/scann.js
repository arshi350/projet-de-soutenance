const { verifyQRCode, getEventScanStats } = require('../../services/scannService');

const verifyScanController = async (req, res) => {
  try {
    const result = await verifyQRCode(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur verifyScanController:', error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Erreur lors de la vérification du QR code.",
      alreadyScanned: error.alreadyScanned || false,
      scannedAt: error.scannedAt || null,
      accessDenied: error.accessDenied || false
    });
  }
};

const getScanStatsController = async (req, res) => {
  try {
    const { eventId } = req.params;
    const stats = await getEventScanStats(eventId);
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Erreur getScanStatsController:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des statistiques de scan."
    });
  }
};

module.exports = { 
  verifyScanController,
  getScanStatsController
};