import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../models/event_model.dart';
import '../services/scan_service.dart';
import '../theme/app_colors.dart';
import 'scan_success_page.dart';
import 'scan_failure_page.dart';
import 'scan_warning_page.dart';

class ScanPageBodyContent extends StatefulWidget {
  final EventModel event;

  const ScanPageBodyContent({super.key, required this.event});

  @override
  State<ScanPageBodyContent> createState() => _ScanPageBodyContentState();
}

class _ScanPageBodyContentState extends State<ScanPageBodyContent> {
  late MobileScannerController _scannerController;
  bool _isFlashOn = false;
  bool _isSoundOn = true;
  bool _isProcessing = false;
  String _lastScanResult = '';
  String _lastScanName = '';
  String _lastScanTime = '';

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
    setState(() => _isFlashOn = !_isFlashOn);
    _scannerController.toggleTorch();
  }

  void _toggleSound() {
    setState(() => _isSoundOn = !_isSoundOn);
  }

  void _resetScanner() {
    setState(() {
      _lastScanResult = '';
      _lastScanName = '';
      _lastScanTime = '';
    });
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;
    final String? qrCode = capture.barcodes.first.rawValue;
    if (qrCode == null) return;

    setState(() => _isProcessing = true);
    try {
      final result = await ScanService.verifyQRCode(qrCode, widget.event.id);

      if (!mounted) return;
      if (result.success && !result.alreadyScanned && result.guest != null) {
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
      } else if (result.alreadyScanned && result.guest != null) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => ScanWarningPage(
              event: widget.event,
              guest: result.guest!,
            ),
          ),
        );
      } else {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const ScanFailurePage()),
        );
      }
    } catch (e) {
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const ScanFailurePage()),
      );
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  String _getFormattedTime() {
    final now = DateTime.now();
    return '${now.hour}h${now.minute.toString().padLeft(2, '0')}';
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
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isActive
                  ? AppColors.orange
                  : AppColors.blueLight.withValues(alpha: 0.8),
              shape: BoxShape.circle,
              border: Border.all(
                color: isActive
                    ? AppColors.orangeLight
                    : AppColors.white.withValues(alpha: 0.15),
              ),
              boxShadow: isActive
                  ? [
                      BoxShadow(
                        color: AppColors.orange.withValues(alpha: 0.4),
                        blurRadius: 12,
                        spreadRadius: 1,
                      ),
                    ]
                  : [],
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
            style: GoogleFonts.plusJakartaSans(
              fontSize: 12,
              color: isActive ? AppColors.orange : AppColors.grey,
              fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final attendanceRate = widget.event.totalGuests > 0
        ? (widget.event.scannedGuests / widget.event.totalGuests).toDouble()
        : 0.0;

    return Stack(
      children: [
        MobileScanner(
          controller: _scannerController,
          onDetect: _onDetect,
          errorBuilder: (context, error, child) {
            return Container(
              color: AppColors.cameraBackground,
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.no_photography_rounded, size: 56, color: AppColors.grey),
                    const SizedBox(height: 16),
                    Text(
                      'Erreur d\'accès à la caméra',
                      style: GoogleFonts.plusJakartaSans(color: AppColors.grey),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
        // Viseur QR haute technologie avec coins néon
        Center(
          child: Container(
            width: 270,
            height: 270,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: AppColors.orange.withValues(alpha: 0.8),
                width: 2,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.orange.withValues(alpha: 0.2),
                  blurRadius: 25,
                  spreadRadius: 5,
                ),
              ],
            ),
            child: Stack(
              children: [
                Align(
                  alignment: Alignment.bottomCenter,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.blue.withValues(alpha: 0.85),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: AppColors.white.withValues(alpha: 0.15),
                      ),
                    ),
                    child: Text(
                      'Centrez le QR Code',
                      style: GoogleFonts.plusJakartaSans(
                        color: AppColors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        // Panneau inférieur cinématique
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.cardBackground,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
              border: Border.all(
                color: AppColors.white.withValues(alpha: 0.1),
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.5),
                  blurRadius: 25,
                  offset: const Offset(0, -8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'PROGRESSION DES ENTRÉES',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: AppColors.orange,
                            letterSpacing: 1,
                          ),
                        ),
                        Text(
                          '${widget.event.scannedGuests} / ${widget.event.totalGuests} (${(attendanceRate * 100).toInt()}%)',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.white,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: LinearProgressIndicator(
                        value: attendanceRate,
                        backgroundColor: AppColors.greyLight.withValues(alpha: 0.3),
                        color: AppColors.orange,
                        minHeight: 8,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildControlButton(
                      icon: Icons.flash_on_rounded,
                      label: 'Flash',
                      isActive: _isFlashOn,
                      onTap: _toggleFlash,
                    ),
                    _buildControlButton(
                      icon: Icons.volume_up_rounded,
                      label: 'Sons',
                      isActive: _isSoundOn,
                      onTap: _toggleSound,
                    ),
                    _buildControlButton(
                      icon: Icons.refresh_rounded,
                      label: 'Réinit.',
                      isActive: false,
                      onTap: _resetScanner,
                    ),
                  ],
                ),
                if (_lastScanResult.isNotEmpty) ...[
                  const SizedBox(height: 20),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: _lastScanResult == 'valid'
                          ? AppColors.green.withValues(alpha: 0.15)
                          : AppColors.red.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: _lastScanResult == 'valid'
                            ? AppColors.green.withValues(alpha: 0.4)
                            : AppColors.red.withValues(alpha: 0.4),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          _lastScanResult == 'valid'
                              ? Icons.check_circle_rounded
                              : Icons.error_rounded,
                          color: _lastScanResult == 'valid'
                              ? AppColors.green
                              : AppColors.red,
                          size: 22,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'DERNIER SCAN : $_lastScanName',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: _lastScanResult == 'valid'
                                      ? AppColors.green
                                      : AppColors.red,
                                ),
                              ),
                              if (_lastScanResult == 'valid')
                                Text(
                                  'Pass valide • $_lastScanTime',
                                  style: GoogleFonts.plusJakartaSans(
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
              ],
            ),
          ),
        ),
      ],
    );
  }
}

