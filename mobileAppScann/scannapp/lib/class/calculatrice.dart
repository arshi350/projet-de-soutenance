import 'package:flutter/material.dart';

class CarteProfil extends StatelessWidget {
 final String nom;
 final String email;
 final String? photoUrl;
 
 const CarteProfil({super.key, required this.nom, required this.email, 
this.photoUrl});
 
 @override
 Widget build(BuildContext context) {
 return Card(
 elevation: 4,
 child: Padding(
 padding: const EdgeInsets.all(16),
 child: Row(
 children: [
 CircleAvatar(
 backgroundImage: photoUrl != null ? NetworkImage(photoUrl!) : 
null,
 child: photoUrl == null ? Text(nom[0].toUpperCase()) : null,
 ),
 const SizedBox(width: 16),
 Column(
 crossAxisAlignment: CrossAxisAlignment.start,
 children: [
 Text(nom, style: const TextStyle(fontSize: 18, fontWeight: 
FontWeight.bold)),
 Text(email, style: const TextStyle(color: Colors.grey)),
 ],
 ),
 ],
 ),
 ),
 );
 }
}