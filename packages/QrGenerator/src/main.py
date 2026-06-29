import sys
from .configLoader import loadConfig
from .qrGenerator import StandardQrGenerator
from .imageProcessor import LayoutImageProcessor

def runApplication(configPath: str) -> None:
    appConfig = loadConfig(configPath)
    
    generator = StandardQrGenerator()
    processor = LayoutImageProcessor()
    
    baseQr = generator.generate(appConfig.qr)
    finalImage = processor.composeFinal(baseQr, appConfig)
    
    finalImage.save(appConfig.image.output, quality=95)
    print(f"Success! QR Layout saved to: {appConfig.image.output}")

def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: uv run generate-qr path/to/config.yml")
        sys.exit(1)
        
    configPath = sys.argv[1]
    runApplication(configPath)

if __name__ == "__main__":
    main()