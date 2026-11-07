from enum import Enum

class CompartmentState(Enum):
    """Enum for package sizes"""
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    OUT_OF_SERVICE = "out_of_service"
