import yaml
from .types import AppConfig, ImageConfig, QrConfig, PositionConfig, ColorConfig, MarginConfig, LogoConfig
from .enums import ErrorCorrection

def loadConfig(filePath: str) -> AppConfig:
    with open(filePath, 'r', encoding='utf-8') as file:
        rawData = yaml.safe_load(file)
    
    if not rawData:
        raise ValueError("YAML file is empty or invalid.")
        
    return _mapDictToAppConfig(rawData)

def _mapDictToAppConfig(data: dict) -> AppConfig:
    imgData = data.get("image", {})
    qrData = data.get("qr", {})
    
    imageConfig = ImageConfig(
        inputLayout=imgData.get("inputLayout", ""),
        output=imgData.get("output", "")
    )
    
    qrConfig = _mapDictToQrConfig(qrData)
    return AppConfig(image=imageConfig, qr=qrConfig)

def _mapDictToQrConfig(qrData: dict) -> QrConfig:
    pos = qrData.get("position", {})
    col = qrData.get("colors", {})
    mar = qrData.get("margin", {})
    log = qrData.get("logo", {})
    
    correctionStr = qrData.get("correction", "H")
    correctionEnum = ErrorCorrection[correctionStr]
    
    return QrConfig(
        url=qrData.get("url", ""),
        size=qrData.get("size", 300),
        position=PositionConfig(x=pos.get("x", 0), y=pos.get("y", 0)),
        correction=correctionEnum,
        colors=ColorConfig(foreground=col.get("foreground", "#000"), background=col.get("background", "#FFF")),
        margin=MarginConfig(
            size=mar.get("size", 10),
            color=mar.get("color", "#FFFFFFFF"),
            cornerRadius=mar.get("cornerRadius", 0) # Mapeo de la nueva propiedad
        ),
        logo=LogoConfig(
            enabled=log.get("enabled", False),
            imagePath=log.get("image", ""),
            size=log.get("size", 50),
            padding=log.get("padding", 5),
            backgroundColor=log.get("backgroundColor", "#FFF")
        )
    )