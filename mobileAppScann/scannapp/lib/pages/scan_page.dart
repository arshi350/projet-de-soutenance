// lib/pages/scan_page.dart
import 'package:arshievent_scan/models/guest_model.dart';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../models/event_model.dart';
import '../services/scan_service.dart';
import '../theme/app_colors.dart';
import '../widgets/bottom_nav_bar.dart';
import 'scan_success_page.dart';
import 'scan_failure_page.dart';
import 'scan_warning_page.dart';

class ScanPage extends StatefulWidget {
  final EventModel event;

  const ScanPage({super.key, required this.event});

  @override
  State<ScanPage> createState() => _ScanPageState();
}

class _ScanPageState extends State<ScanPage> {
  late MobileScannerController _scannerController;
  bool _isFlashOn = false;
  bool _isSoundOn = true;
  bool _isProcessing = false;
  String _lastScanResult = '';
  String _lastScanName = '';
  String _lastScanTime = '';

  bool _isCameraActive = true;

  @override
  void initState() {
    super.initState();
    _scannerController = MobileScannerController(
      torchEnabled: false,
      facing: CameraFacing.back,
    );
  }

  @override
  void dispose() {
    _scannerController.dispose();
    super.dispose();
  }

  void _toggleFlash() {
    setState(() {
      _isFlashOn = !_isFlashOn;
    });
    _scannerController.toggleTorch();
  }

  void _toggleSound() {
    setState(() {
      _isSoundOn = !_isSoundOn;
    });
  }

  Future<void> _toggleCamera() async {
    if (_isCameraActive) {
      await _scannerController.stop();
      if (mounted) setState(() => _isCameraActive = false);
    } else {
      await _scannerController.start();
      if (mounted) setState(() => _isCameraActive = true);
    }
  }

  void _resetScanner() {
    setState(() {
      _lastScanResult = '';
      _lastScanName = '';
      _lastScanTime = '';
    });
    if (!_isCameraActive) {
      _toggleCamera();
    }
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_isProcessing || !_isCameraActive) return;

    final String? qrCode = capture.barcodes.first.rawValue;
    if (qrCode == null) return;

    setState(() {
      _isProcessing = true;
      _isCameraActive = false; // Caméra désactivée automatiquement après le scan
    });

    // Désactivation immédiate du flux caméra
    try {
      await _scannerController.stop();
    } catch (e) {
      debugPrint('Erreur arrêt caméra: $e');
    }

    try {
      final result = await ScanService.verifyQRCode(qrCode, widget.event.id);

      if (!mounted) return;
      if (result.success && !result.alreadyScanned && result.guest != null) {
        // Scan réussi (Privé ou Public)
        setState(() {
          _lastScanResult = 'valid';
          _lastScanName = result.guest!.fullName;
          _lastScanTime = _getFormattedTime();
        });

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => ScanSuccessPage(
              event: widget.event,
              guest: result.guest!,
            ),
          ),
        );
      } else if (result.alreadyScanned) {
        // QR déjà scanné (HTTP 409 Conflict)
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => ScanWarningPage(
              event: widget.event,
              guest: result.guest ??
                  GuestModel(
                    id: '',
                    firstName: 'Billet',
                    lastName: 'Déjà Scanné',
                    email: '',
                    phone: '',
                    status: 'present',
                    idEvent: widget.event.id,
                  ),
              scannedAt: result.scannedAt,
              errorMessage: result.error,
            ),
          ),
        );
      } else {
        // QR invalide ou révoqué
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => ScanFailurePage(event: widget.event),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => ScanFailurePage(event: widget.event),
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  String _getFormattedTime() {
    final now = DateTime.now();
    return '${now.hour}:${now.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final attendanceRate = widget.event.totalGuests > 0
        ? (widget.event.scannedGuests / widget.event.totalGuests).toDouble()
        : 0.0;

    return Scaffold(
      body: Stack(
        children: [
          // === ZONE CAMÉRA ===
          MobileScanner(
            controller: _scannerController,
            onDetect: _onDetect,
            errorBuilder: (context, error, child) {
              return Container(
                color: AppColors.cameraBackground,
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.no_photography,
                          size: 50, color: Colors.white54),
                      SizedBox(height: 16),
                      Text(
                        'Erreur d\'accès à la caméra',
                        style: TextStyle(color: Colors.white54),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),

          // === CADRE DE SCAN (overlay) ===
          Center(
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white, width: 2),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Align(
                alignment: Alignment.bottomCenter,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'Placez le QR code dans le cadre',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                    ),
                  ),
                ),
              ),
            ),
          ),

          // === APP BAR ===
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const Text(
                    'Scan des entrées',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.settings_outlined,
                        color: Colors.white),
                    onPressed: () {
                      // Naviguer vers les paramètres
                    },
                  ),
                ],
              ),
            ),
          ),

          // === PANEL INFÉRIEUR (progression + contrôles + dernier scan) ===
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(24)),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.black.withValues(alpha: 0.1),
                    blurRadius: 20,
                    offset: const Offset(0, -5),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // === PROGRESSION ===
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Progression des entrées',
                            style:
                                TextStyle(fontSize: 12, color: AppColors.grey),
                          ),
                          Text(
                            '${widget.event.scannedGuests} / ${widget.event.totalGuests} (${(attendanceRate * 100).toInt()}%)',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.black,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: LinearProgressIndicator(
                          value: attendanceRate,
                          backgroundColor: AppColors.greyLight,
                          color: AppColors.orange,
                          minHeight: 8,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // === BOUTONS DE CONTRÔLE (Flash, Sons, Réinit.) ===
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      // Flash
                      _buildControlButton(
                        icon: Icons.flash_on,
                        label: 'Flash',
                        isActive: _isFlashOn,
                        onTap: _toggleFlash,
                      ),
                      // Sons
                      _buildControlButton(
                        icon: Icons.volume_up,
                        label: 'Sons',
                        isActive: _isSoundOn,
                        onTap: _toggleSound,
                      ),
                      // Réinitialiser
                      _buildControlButton(
                        icon: Icons.refresh,
                        label: 'Réinit.',
                        isActive: false,
                        onTap: _resetScanner,
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // === DERNIER SCAN ===
                  if (_lastScanResult.isNotEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _lastScanResult == 'valid'
                            ? AppColors.green.withValues(alpha: 0.1)
                            : AppColors.red.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            _lastScanResult == 'valid'
                                ? Icons.check_circle
                                : Icons.error,
                            color: _lastScanResult == 'valid'
                                ? AppColors.green
                                : AppColors.red,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'DERNIER SCAN : $_lastScanName',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: _lastScanResult == 'valid'
                                        ? AppColors.green
                                        : AppColors.red,
                                  ),
                                ),
                                if (_lastScanResult == 'valid')
                                  Text(
                                    'Pass valide • $_lastScanTime',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: AppColors.grey,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
      // === BOTTOM NAVIGATION BAR ===
      bottomNavigationBar: BottomNavBar(
        currentItem: NavItem.scanner,
        onItemSelected: (item) {
          if (item == NavItem.home) {
            Navigator.pop(context);
          } else if (item == NavItem.guests) {
            // Naviguer vers la page des invités
          } else if (item == NavItem.stats) {
            // Naviguer vers la page des statistiques
          }
        },
      ),
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    required String label,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isActive ? AppColors.orange : AppColors.greyBackground,
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: isActive ? AppColors.white : AppColors.grey,
              size: 22,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: isActive ? AppColors.orange : AppColors.grey,
              fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }
}
