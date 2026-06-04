
// Importation du modèle utilisateur
const{ userModel} = require("../models/user")
const bcrypt = require("bcrypt")

// ajouter un nouvel utilisateur
const addUser = async (req, res) =>{
    try {
        // Récupération des données envoyées dans le corps de la requête
        const {first_name, last_name, email, phone, city, password} = req.body

        //verification de la présence de tous les champs obligatoires
        if(!first_name || !last_name || !email || !phone || !city || !password){
            return res.status(400).json({message: "tous les champs sont obligatoires"})
        }

        //verification de la validité de l'email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message: "L'email n'est pas valide"})
        }
        //verifier si l'email n'existe pas dans la BD
        const existingUser = await userModel.findOne({ email })
        if(existingUser){
            return res.status(400).json({message: "L'email existe déjà"})
        }

        //verification de la validité du numéro de téléphone
        const phoneRegex = /^6[25789]\d{7}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ 
                message: "Le numéro de téléphone n'est pas valide. Il doit contenir 9 chiffres, commencer par 6 et le deuxième chiffre doit être 2, 5, 7, 8 ou 9. Exemple: 683660987" 
            });
        }

        //verifier si le numéro de téléphone n'existe pas dans la BD
        const existingPhone = await userModel.findOne({ phone })
        if(existingPhone){
            return res.status(400).json({message:"le numero de telephone existe deja"})
        }

        //hashage du mot de passe
            //generer une chaine aleatoire salt
        const salt = await bcrypt.genSalt(10)
        const hashpassword = await bcrypt.hash(password, salt)


        // Création d'une nouvelle instance du modèle utilisateur avec les données reçues
        const newUser = new userModel({
            first_name,
            last_name,
            email,
            phone,
            city,
            password : hashpassword,
            role: req.body.role || 'user'
            // date: Date.now() // Ajout de la date de création
        })

        // Sauvegarde du nouvel utilisateur dans la base de données
        const result = await newUser.save()

        console.log("utilisateur ajouté avec succès", result);

        // Réponse envoyée au client avec le résultat
        res.status(201).json({message: "utilisateur ajouté avec succès", result})

    } catch (error) {
        // Gestion des erreurs et envoi d'un message d'erreur au client
        res.status(500).json({message: "erreur lors de l'ajout d'un utilisateur", error})
        console.log("erreur lors de l'ajout d'un utilisateur", error);
    }
}

//recuperer tous les utilisateurs de la base de donnees
const getAllUsers = async (req, res)=>{
    try {
        const users = await userModel.find()
        if(users.length === 0){
            return res.status(404).json({message: "aucun utilisateur trouvé"})
        }
        let userN = users.length
        return res.status(200).json({message: "utilisateurs récupérés avec succès", count: userN , users})
    } catch (error) {
        return res.status(500).json({message: "erreur lors de la recuperation des utilisateurs", error})
    }
}

// Récupérer un utilisateur spécifique par son id avec une meilleure gestion des erreurs
const getOneUser = async (req, res) => {
    try {
        const id = req.params.id;

        // Vérification de la validité de l'identifiant MongoDB
        if (!id || id.length !== 24) {
            return res.status(400).json({ message: "ID utilisateur invalide" });
        }

        // Recherche de l'utilisateur par son ID
        const user = await userModel.findById(id);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        return res.status(200).json({ message: "Utilisateur récupéré avec succès", user });

    } catch (error) {
        // Gestion des erreurs, y compris les erreurs de format d'ID
        return res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur", error: error.message });
    }
}

//modifier un utilisateur specifique par son id
const updateUser = async (req, res)=>{
    try {
        const id = req.params.id

        let nName = req.body.first_name
        let nLName = req.body.last_name
        let Nemail = req.body.email
        let Nphone = req.body.phone 
        let Ncity = req.body.city 
        let Npassword = req.body.password

        const user = await userModel.updateOne({_id:id}, {$set : {
            first_name : nName, 
            last_name : nLName, 
            email : Nemail,
            phone : Nphone,
            city : Ncity ,
            password : Npassword
        }})
        return res.status(201).json({message:"utilisateur modifier avec succes", user})
        
    } catch (error) {
        return res.status(500).json({message: "erreur lors de la modification de l'utilisateur", error})
    }
}

// Suspendre un utilisateur
const suspendUser = async (req, res) => {
    try {
        const id = req.params.id
        const reason = req.body.reason || 'Compte suspendu par un administrateur'

        if (!id || id.length !== 24) {
            return res.status(400).json({ message: 'ID utilisateur invalide' })
        }

        const user = await userModel.findByIdAndUpdate(
            id,
            { suspended: true, suspensionReason: reason },
            { new: true }
        )

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        }

        return res.status(200).json({ message: 'Utilisateur suspendu avec succès', user })
    } catch (error) {
        return res.status(500).json({ message: 'Erreur lors de la suspension de l utilisateur', error })
    }
}

// Annuler la suspension d'un utilisateur
const unsuspendUser = async (req, res) => {
    try {
        const id = req.params.id

        if (!id || id.length !== 24) {
            return res.status(400).json({ message: 'ID utilisateur invalide' })
        }

        const user = await userModel.findByIdAndUpdate(
            id,
            { suspended: false, suspensionReason: '' },
            { new: true }
        )

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' })
        }

        return res.status(200).json({ message: 'Suspension annulée avec succès', user })
    } catch (error) {
        return res.status(500).json({ message: 'Erreur lors de l annulation de la suspension', error })
    }
}

//supprimer un utilisateur specifique
const deleteUser = async (req, res)=>{
    try {
        const id = req.params.id
        const user = await userModel.deleteOne({_id:id})
        return res.status(200).json({message:"utilisateur supprimer avec succes", user})

    } catch (error) {
        return res.status(500).json({message:"erreur lors de la suppression"})
    }
}

const addAdmin = async (req, res) => {
    try {
        req.body.role = 'admin'
        return await addUser(req, res)
    } catch (error) {
        return res.status(500).json({ message: 'erreur lors de l ajout de l administrateur', error })
    }
}

module.exports = {addUser, addAdmin, getAllUsers, getOneUser, updateUser, deleteUser, suspendUser, unsuspendUser}