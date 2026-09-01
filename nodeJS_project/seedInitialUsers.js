require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { userModel } = require('./models/user');
const Invites = require('./models/invitesModel/invites');
const { eventModel } = require('./models/eventModels/event');

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('⚡ Connexion MongoDB réussie pour le seeding d\'utilisateurs.');

    const initialUsers = [
      {
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: 690123456,
        city: 'PARIS',
        password: 'Password123!',
        role: 'user',
        plan: 'PREMIUM',
        price: '29 900 FCFA/mois'
      },
      {
        first_name: 'Marie',
        last_name: 'Curie',
        email: 'marie.curie@example.com',
        phone: 695987654,
        city: 'LYON',
        password: 'Password123!',
        role: 'user',
        plan: 'VIP',
        price: '49 000 FCFA/mois'
      },
      {
        first_name: 'Tech Events',
        last_name: 'SAS',
        email: 'contact@techevents.com',
        phone: 677112233,
        city: 'YAOUNDE',
        password: 'Password123!',
        role: 'user',
        plan: 'PREMIUM',
        price: '29 900 FCFA/mois'
      },
      {
        first_name: 'Paul',
        last_name: 'Martin',
        email: 'paul.martin@example.com',
        phone: 655443322,
        city: 'DOUALA',
        password: 'Password123!',
        role: 'user',
        plan: 'STARTER',
        price: '0 FCFA/mois'
      },
      {
        first_name: 'Sophie',
        last_name: 'Bernard',
        email: 'sophie.bernard@example.com',
        phone: 688998877,
        city: 'KRIBI',
        password: 'Password123!',
        role: 'user',
        plan: 'STARTER',
        price: '0 FCFA/mois'
      }
    ];

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123!', salt);

    for (const u of initialUsers) {
      const exists = await userModel.findOne({ email: u.email });
      if (!exists) {
        await userModel.create({
          ...u,
          password: hashedPassword
        });
        console.log(`✅ Utilisateur créé : ${u.first_name} ${u.last_name} (${u.email})`);
      } else {
        console.log(`ℹ️ Utilisateur existant déjà : ${u.email}`);
      }
    }

    // Récupérer un événement pour y lier des invités
    const event = await eventModel.findOne();
    if (event) {
      const initialInvites = [
        { nom: 'Kamen', prenom: 'Luc', email: 'luc.kamen@gmail.com', telephone: '690111222', status: 'vip', idEvent: event._id },
        { nom: 'Nguema', prenom: 'Grace', email: 'grace.nguema@gmail.com', telephone: '695333444', status: 'classique', idEvent: event._id },
        { nom: 'Fosso', prenom: 'Patrick', email: 'patrick.fosso@gmail.com', telephone: '677555666', status: 'classique', idEvent: event._id }
      ];
      for (const inv of initialInvites) {
        const invExists = await Invites.findOne({ email: inv.email, idEvent: event._id });
        if (!invExists) {
          await Invites.create(inv);
          console.log(`🎟️ Invité créé : ${inv.prenom} ${inv.nom}`);
        }
      }
    }

    console.log('🎉 Seeding terminé avec succès.');
  } catch (err) {
    console.error('❌ Erreur seeding :', err);
  } finally {
    mongoose.connection.close();
  }
}

seedUsers();
