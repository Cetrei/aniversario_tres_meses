from enum import Enum
import qrcode.constants

class ErrorCorrection(Enum):
    L = qrcode.constants.ERROR_CORRECT_L
    M = qrcode.constants.ERROR_CORRECT_M
    Q = qrcode.constants.ERROR_CORRECT_Q
    H = qrcode.constants.ERROR_CORRECT_H