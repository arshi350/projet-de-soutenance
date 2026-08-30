/**
 * Service de calcul de tarification dynamique pour la plateforme événementielle v2.0
 * Conforme au cahier des charges : (Jours * Tarif_Base) + (Nb_Invités * Coût_Canal)
 */

const PRICING_CONFIG = {
    PRIVATE: {
        BASE_DAILY_FEE: 5.0,     // 5€ par jour
        COST_PER_EMAIL: 0.02,    // 0.02€ par invité par email
        COST_PER_WHATSAPP: 0.05, // 0.05€ par invité par WhatsApp
        COST_BOTH_CHANNELS: 0.07 // 0.07€ pour les deux
    },
    PUBLIC: {
        BASE_DAILY_FEE: 10.0,    // 10€ par jour d'infrastructure
        COST_PER_CAPACITY: 0.01, // 0.01€ par place de jauge
        COMMISSION_PERCENT: 0.025, // 2.5% de commission par billet
        COMMISSION_FIXED: 0.50    // 0.50€ fixe par billet
    }
};

/**
 * Calcule la durée en jours entre deux dates (minimum 1 jour)
 */
const calculateDurationInDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays || 1);
};

/**
 * Calcul du coût d'un événement privé
 * Formule : (Jours * Tarif_Base) + (Nb_Invités * Coût_Canal)
 */
const calculatePrivateEventPrice = ({ startDate, endDate, guestCount = 50, channel = 'email' }) => {
    const days = calculateDurationInDays(startDate, endDate);
    const baseDaily = PRICING_CONFIG.PRIVATE.BASE_DAILY_FEE;
    const baseFee = Number((days * baseDaily).toFixed(2));

    let unitChannelCost = PRICING_CONFIG.PRIVATE.COST_PER_EMAIL;
    if (channel === 'whatsapp') {
        unitChannelCost = PRICING_CONFIG.PRIVATE.COST_PER_WHATSAPP;
    } else if (channel === 'both') {
        unitChannelCost = PRICING_CONFIG.PRIVATE.COST_BOTH_CHANNELS;
    }

    const count = Math.max(1, parseInt(guestCount, 10) || 1);
    const channelCost = Number((count * unitChannelCost).toFixed(2));
    const total = Number((baseFee + channelCost).toFixed(2));

    return {
        durationDays: days,
        baseDailyRate: baseDaily,
        baseFee,
        channel,
        unitChannelCost,
        guestCount: count,
        channelCost,
        total,
        currency: 'EUR'
    };
};

/**
 * Calcul du montant pour une extension de jauge (Upgrade au prorata)
 */
const calculateQuotaUpgrade = ({ currentMaxGuests, additionalGuests, channel = 'email' }) => {
    let unitChannelCost = PRICING_CONFIG.PRIVATE.COST_PER_EMAIL;
    if (channel === 'whatsapp') {
        unitChannelCost = PRICING_CONFIG.PRIVATE.COST_PER_WHATSAPP;
    } else if (channel === 'both') {
        unitChannelCost = PRICING_CONFIG.PRIVATE.COST_BOTH_CHANNELS;
    }

    const extra = Math.max(1, parseInt(additionalGuests, 10) || 0);
    const upgradeCost = Number((extra * unitChannelCost).toFixed(2));

    return {
        currentMaxGuests,
        additionalGuests: extra,
        newMaxGuests: currentMaxGuests + extra,
        unitChannelCost,
        upgradeCost,
        currency: 'EUR'
    };
};

/**
 * Calcul des frais d'activation d'un événement public
 */
const calculatePublicActivationFee = ({ startDate, endDate, maxCapacity = 200 }) => {
    const days = calculateDurationInDays(startDate, endDate);
    const baseDaily = PRICING_CONFIG.PUBLIC.BASE_DAILY_FEE;
    const baseFee = Number((days * baseDaily).toFixed(2));

    const capacity = Math.max(10, parseInt(maxCapacity, 10) || 10);
    const capacityFee = Number((capacity * PRICING_CONFIG.PUBLIC.COST_PER_CAPACITY).toFixed(2));
    const total = Number((baseFee + capacityFee).toFixed(2));

    return {
        durationDays: days,
        baseDailyRate: baseDaily,
        baseFee,
        maxCapacity: capacity,
        capacityFee,
        total,
        currency: 'EUR'
    };
};

/**
 * Calcul des commissions sur un billet public (B2C)
 */
const calculateTicketPriceAndCommission = ({ unitPrice = 0, quantity = 1, feeBearer = 'buyer' }) => {
    const subtotal = Number((unitPrice * quantity).toFixed(2));
    
    // Commission par billet : 2.5% + 0.50€
    const singleCommission = (unitPrice * PRICING_CONFIG.PUBLIC.COMMISSION_PERCENT) + PRICING_CONFIG.PUBLIC.COMMISSION_FIXED;
    const totalCommission = Number((singleCommission * quantity).toFixed(2));

    let buyerTotal = subtotal;
    let organizerRevenue = subtotal;

    if (feeBearer === 'buyer') {
        buyerTotal = Number((subtotal + totalCommission).toFixed(2));
        organizerRevenue = subtotal;
    } else {
        buyerTotal = subtotal;
        organizerRevenue = Math.max(0, Number((subtotal - totalCommission).toFixed(2)));
    }

    return {
        unitPrice,
        quantity,
        subtotal,
        feeBearer,
        commissionPerTicket: Number(singleCommission.toFixed(2)),
        totalCommission,
        buyerTotal,
        organizerRevenue,
        currency: 'EUR'
    };
};

module.exports = {
    PRICING_CONFIG,
    calculateDurationInDays,
    calculatePrivateEventPrice,
    calculateQuotaUpgrade,
    calculatePublicActivationFee,
    calculateTicketPriceAndCommission
};
