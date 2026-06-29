import qrcode
from PIL.Image import Image
from .types import QrConfig
from .interfaces import IQrGenerator

class StandardQrGenerator(IQrGenerator):
    
    def generate(self, config: QrConfig) -> Image:
        if not config.url:
            raise ValueError("QR URL cannot be empty.")
            
        qr = qrcode.QRCode(
            error_correction=config.correction.value,
            box_size=10,
            border=0
        )
        
        qr.add_data(config.url)
        qr.make(fit=True)
        
        qrImage = qr.make_image(
            fill_color=config.colors.foreground,
            back_color=config.colors.background
        ).convert("RGBA")
        
        return qrImage.resize((config.size, config.size))