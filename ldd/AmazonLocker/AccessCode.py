from datetime import datetime
from Compartment import Compartment


class AccessCode:
    """Represents an access code for retrieving a package from a compartment"""

    def __init__(self, code: str, compartment: Compartment, expiry_date: datetime):
        self.code = code
        self.compartment = compartment
        self.expiry_date = expiry_date

    def is_expired(self) -> bool:
        return datetime.now > self.expiry_date

    def get_compartment(self) -> Compartment:
        """Get the compartment this access code unlocks"""
        return self.compartment

    def get_code(self) -> str:
        """Get the access code string"""
        return self.code
