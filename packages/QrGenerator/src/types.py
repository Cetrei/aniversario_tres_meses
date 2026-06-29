from dataclasses import dataclass
from typing import Optional
from .enums import ErrorCorrection

@dataclass
class PositionConfig:
    x: int
    y: int

@dataclass
class ColorConfig:
    foreground: str
    background: str

@dataclass
class LogoConfig:
    enabled: bool
    imagePath: str
    size: int
    padding: int
    backgroundColor: str

@dataclass
class MarginConfig:
    size: int
    color: str          # Soporta "#RRGGBBAA" para transparencias
    cornerRadius: int   # Nuevo campo para esquinas redondeadas

@dataclass
class QrConfig:
    url: str
    size: int
    position: PositionConfig
    correction: ErrorCorrection
    colors: ColorConfig
    margin: MarginConfig
    logo: LogoConfig

@dataclass
class ImageConfig:
    inputLayout: str
    output: str

@dataclass
class AppConfig:
    image: ImageConfig
    qr: QrConfig

@dataclass
class CenteringRequest:
    layoutPath: str
    totalQrSize: int