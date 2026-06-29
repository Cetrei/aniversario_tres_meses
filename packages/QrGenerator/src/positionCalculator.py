from PIL import Image
from .types import CenteringRequest, PositionConfig
from .interfaces import IPositionCalculator

class CenterPositionCalculator(IPositionCalculator):
    
    def calculateCenter(self, request: CenteringRequest) -> PositionConfig:
        if request.totalQrSize <= 0:
            raise ValueError("Total QR size must be greater than zero.")
            
        layoutWidth, layoutHeight = self._getImageDimensions(request.layoutPath)
        
        positionX = (layoutWidth - request.totalQrSize) // 2
        positionY = (layoutHeight - request.totalQrSize) // 2
        
        return PositionConfig(
            x=max(0, positionX),
            y=max(0, positionY)
        )

    def _getImageDimensions(self, imagePath: str) -> tuple[int, int]:
        try:
            with Image.open(imagePath) as image:
                return image.size
        except FileNotFoundError:
            raise FileNotFoundError(f"Layout image not found at: {imagePath}")