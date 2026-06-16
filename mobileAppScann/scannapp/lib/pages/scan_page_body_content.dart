import 'package:flutter/material.dart';
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
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const ScanFailurePage()),
      );
    } finally {
      setState(() => _isProcessing = false);
    }
  }

  String _getFormattedTime() {
    final now = DateTime.now();
    return '${now.hour}:${now.minute.toString().padLeft(2, '0')}';
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
              child: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.no_photography, size: 50, color: Colors.white54),
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
                  style: TextStyle(color: Colors.white, fontSize: 12),
                ),
              ),
            ),
          ),
        ),
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
                  color: AppColors.black.withOpacity(0.1),
                  blurRadius: 20,
                  offset: const Offset(0, -5),
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
                        const Text(
                          'Progression des entrées',
                          style: TextStyle(fontSize: 12, color: AppColors.grey),
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildControlButton(
                      icon: Icons.flash_on,
                      label: 'Flash',
                      isActive: _isFlashOn,
                      onTap: _toggleFlash,
                    ),
                    _buildControlButton(
                      icon: Icons.volume_up,
                      label: 'Sons',
                      isActive: _isSoundOn,
                      onTap: _toggleSound,
                    ),
                    _buildControlButton(
                      icon: Icons.refresh,
                      label: 'Réinit.',
                      isActive: false,
                      onTap: _resetScanner,
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                if (_lastScanResult.isNotEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _lastScanResult == 'valid'
                          ? AppColors.green.withOpacity(0.1)
                          : AppColors.red.withOpacity(0.1),
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
    );
  }
}
