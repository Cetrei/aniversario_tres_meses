from PIL import Image, ImageDraw
from .types import AppConfig, QrConfig
from .interfaces import IImageProcessor

class LayoutImageProcessor(IImageProcessor):
    
    def composeFinal(self, qrImage: Image.Image, config: AppConfig) -> Image.Image:
        if config.qr.logo.enabled:
            qrImage = self._addLogoToQr(qrImage, config.qr)
            
        qrWithMargin = self._applyMargin(qrImage, config.qr)
        return self._placeOnLayout(qrWithMargin, config)

    def _addLogoToQr(self, qrImage: Image.Image, config: QrConfig) -> Image.Image:
        logoConfig = config.logo
        logo = Image.open(logoConfig.imagePath).convert("RGBA")
        logo = logo.resize((logoConfig.size, logoConfig.size))
        
        pos = ((qrImage.size[0] - logoConfig.size) // 2, (qrImage.size[1] - logoConfig.size) // 2)
        qrImage.paste(logo, pos, logo)
        return qrImage

    def _applyMargin(self, qrImage: Image.Image, config: QrConfig) -> Image.Image:
        margin = config.margin
        if margin.size <= 0:
            return qrImage

        newSize = config.size + (margin.size * 2)
        
        # 1. Crear fondo totalmente transparente (RGBA)
        canvas = Image.new("RGBA", (newSize, newSize), (0, 0, 0, 0))
        draw = ImageDraw.Draw(canvas)
        
        # 2. Dibujar el margen usando el radio de curvatura y el color hexadecimal (soporta #RRGGBBAA)
        boundingBox = [0, 0, newSize, newSize]
        draw.rounded_rectangle(
            boundingBox,
            radius=margin.cornerRadius,
            fill=margin.color
        )
        
        # 3. Superponer el QR centrado usando su propio canal alfa como máscara de pegado
        canvas.paste(qrImage, (margin.size, margin.size), qrImage)
        return canvas

    def _placeOnLayout(self, qrImage: Image.Image, config: AppConfig) -> Image.Image:
        layout = Image.open(config.image.inputLayout).convert("RGBA")
        
        posX = config.qr.position.x
        posY = config.qr.position.y
        
        # Al pegar en el Layout, usamos 'qrImage' como máscara para preservar transparencias y esquinas redondeadas externas
        layout.paste(qrImage, (posX, posY), qrImage)
        
        if layout.mode == 'RGBA':
            layout = layout.convert('RGB')
            
        return layout