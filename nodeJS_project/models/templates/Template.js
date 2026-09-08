const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
      trim: true,
    },
    titre: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    categorie: {
      type: String,
      default: 'Général',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Template = mongoose.model('Template', templateSchema, 'modele');

module.exports = Template;
