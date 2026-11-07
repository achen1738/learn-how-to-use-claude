from Size import Size
from Package import Package
from AccessCode import AccessCode
from CompartmentState import CompartmentState

class Compartment:
    """Represents an individual compartment in the locker"""

    def __init__(self, compartment_id: int, size: Size):
        self.id = compartment_id
        self.size = size
        self.state = CompartmentState.AVAILABLE

    def is_available(self) -> bool:
        """Check if the compartment is occupied"""
        return self.occupied == CompartmentState.AVAILABLE

    def open(self, access_code: AccessCode) -> None:
        """Open the compartment with the provided access code"""
        pass

    def mark_free(self) -> None:
        """Mark the compartment as free (empty)"""
        self.occupied = CompartmentState.AVAILABLE


    def mark_occupied(self) -> None:
        """Mark the compartment as occupied (locked)"""
        self.occupied = CompartmentState.OCCUPIED

    def mark_out_of_service(self) -> None:
        self.occupied = CompartmentState.OUT_OF_SERVICE

    def get_size(self) -> Size:
        """Get the size of this compartment"""
        return self.size
