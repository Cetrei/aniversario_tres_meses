from typing import Protocol
from PIL.Image import Image
from .types import QrConfig, AppConfig, CenteringRequest, PositionConfig

class IQrGenerator(Protocol):
    def generate(self, config: QrConfig) -> Image:
        """Genera la imagen base del QR."""
        ...

class IImageProcessor(Protocol):
    def composeFinal(self, qrImage: Image, config: AppConfig) -> Image:
        """Coloca el QR en el layout y añade logos/bordes."""
        ...

class IPositionCalculator(Protocol):
    def calculateCenter(self, request: CenteringRequest) -> PositionConfig:
        """Calcula las coordenadas X e Y para centrar un elemento en un layout."""
        ...