require('dotenv').config();
const bcrypt = require('bcrypt');
const { connecter, closeConnection } = require('./db/connect');
const { userModel } = require('./models/user');

function parseArgs() {
  const args = {};
  const rawArgs = process.argv.slice(2);

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === '--help' || arg === '-h') {
      args.help = true;
      continue;
    }

    if (arg.startsWith('--')) {
      const [key, value] = arg.split('=');
      const normalizedKey = key.replace(/^--/, '');

      if (value !== undefined) {
        args[normalizedKey] = value;
      } else {
        const next = rawArgs[i + 1];
        if (next && !next.startsWith('--')) {
          args[normalizedKey] = next;
          i += 1;
        }
      }
    }
  }

  return {
    first_name: args.first_name || process.env.npm_config_first_name || process.env.FIRST_NAME,
    last_name: args.last_name || process.env.npm_config_last_name || process.env.LAST_NAME,
    email: args.email || process.env.npm_config_email || process.env.EMAIL,
    phone: args.phone || process.env.npm_config_phone || process.env.PHONE,
    city: args.city || process.env.npm_config_city || process.env.CITY,
    password: args.password || process.env.npm_config_password || process.env.PASSWORD,
    help: args.help
  };
}

function printHelp() {
  console.log('Usage: node createAdmin.js --first_name=Admin --last_name=Super --email=admin@example.com --phone=683660987 --city=Dakar --password=MonPass123');
  console.log('Vous pouvez aussi utiliser des variables d environnement : FIRST_NAME, LAST_NAME, EMAIL, PHONE, CITY, PASSWORD');
}

async function createAdmin(data) {
  const { first_name, last_name, email, phone, city, password } = data;
  if (!first_name || !last_name || !email || !phone || !city || !password) {
    throw new Error('Veuillez fournir first_name, last_name, email, phone, city et password');
  }

  const existingEmail = await userModel.findOne({ email });
  if (existingEmail) {
    throw new Error('Un utilisateur avec cet email existe déjà');
  }

  const existingPhone = await userModel.findOne({ phone: Number(phone) });
  if (existingPhone) {
    throw new Error('Un utilisateur avec ce numéro de téléphone existe déjà');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const adminUser = new userModel({
    first_name,
    last_name,
    email,
    phone: Number(phone),
    city,
    password: hashedPassword,
    role: 'admin'
  });

  return adminUser.save();
}

const args = parseArgs();
const mongoUrl = process.env.MONGO_URI;

if (args.help) {
  printHelp();
  process.exit(0);
}

if (!mongoUrl) {
  console.error('Erreur : la variable d environnement MONGO_URI est manquante');
  process.exit(1);
}

connecter(mongoUrl, async (error) => {
  if (error) {
    console.error('Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }

  try {
    const result = await createAdmin(args);
    console.log('Administrateur créé avec succès :', result);
  } catch (err) {
    console.error('Erreur lors de la création de l administrateur :', err.message || err);
    process.exit(1);
  } finally {
    closeConnection();
  }
});
