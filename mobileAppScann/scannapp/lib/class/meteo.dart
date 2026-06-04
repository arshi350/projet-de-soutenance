import 'package:flutter/material.dart';

class ProfilePage extends StatefulWidget {
 const ProfilePage({super.key});
 @override State<ProfilePage> createState() => _ProfilePageState();
}
class _ProfilePageState extends State<ProfilePage> {
 bool _notificationsActive = true;
 @override Widget build(BuildContext context) {
 return Scaffold(
 appBar: AppBar(title: const Text('Mon Profil')),
 body: Column(children: [
 Stack(alignment: Alignment.bottomRight, children: [
 CircleAvatar(radius: 60, backgroundImage: NetworkImage('...')),
 CircleAvatar(radius: 18, backgroundColor: Colors.green,
 child: Icon(Icons.check, color: Colors.white, size: 16)),
 ]),
 Text('Alice Dupont', style: TextStyle(fontSize: 24, fontWeight: 
FontWeight.bold)),
 SwitchListTile(
 title: Text('Notifications'),
 value: _notificationsActive,
 onChanged: (v) => setState(() => _notificationsActive = v),
 ),
 ElevatedButton(onPressed: (){}, child: Text('Modifier le profil')),
 ]),
 );
 }
}