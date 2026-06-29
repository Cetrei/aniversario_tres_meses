import sys
from .configLoader import loadConfig
from .types import PositionConfig, CenteringRequest
from .positionCalculator import CenterPositionCalculator

def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: uv run find-center path/to/config.yml")
        sys.exit(1)
        
    configPath = sys.argv[1]
    
    try:
        _processCenteringRequest(configPath)
    except Exception as error:
        print(f"Error executing center finder: {error}")
        sys.exit(1)

def _processCenteringRequest(configPath: str) -> None:
    appConfig = loadConfig(configPath)
    
    # El tamaño total en pantalla incluye los márgenes a ambos lados
    marginOffset = appConfig.qr.margin.size * 2
    totalQrSize = appConfig.qr.size + marginOffset
    
    request = CenteringRequest(
        layoutPath=appConfig.image.inputLayout,
        totalQrSize=totalQrSize
    )
    
    calculator = CenterPositionCalculator()
    optimalPosition = calculator.calculateCenter(request)
    
    _printResult(optimalPosition)

def _printResult(position: PositionConfig) -> None:
    print("\n=== Optimal Center Position Calculated ===")
    print(f"position:")
    print(f"  x: {position.x}")
    print(f"  y: {position.y}")
    print("==========================================\n")
    print("Update your config.yml with these values.")