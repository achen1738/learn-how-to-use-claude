from typing import List, TYPE_CHECKING
from Compartment import Compartment
from Size import Size
from AccessCode import AccessCode
from Package import Package
from datetime import datetime
import random


class Locker:
    """Represents an Amazon Locker system for storing and retrieving packages"""

    def __init__(self, compartments: List[Compartment]):
        self.compartments = compartments
        self.access_token_mapping: dict[str, AccessCode] = {}

    def __get_compartment(self, size: Size) -> Compartment:
        sizes = [Size.SMALL, Size.MEDIUM, Size.LARGE]
        size_index = sizes.index(size)
        for i in range (size_index, len(sizes)):
            for compartment in self.compartments:
                if compartment.getSize() == sizes[i] and compartment.is_available():
                    return compartment
        return None

    def store_package(self, package: Package) -> AccessCode:
        compartment = self.__get_compartment(package.get_size())
        if compartment == None:
            raise Exception(f"No available compartment of size {package.get_size()}")

        compartment.open()
        compartment.mark_occupied()
        access_code = self.generate_access_code()
        self.access_token_mapping[access_code.get_code()] = access_code
        return access_code

    def unlock_compartment(self, access_code: AccessCode) -> None:
        """Unlock a compartment using an access code"""
        if access_code.get_code() not in self.access_token_mapping:
            raise Exception("Incorrect access code")

        if access_code.is_expired():
            raise Exception("Access code is expired")
        
        compartment = access_code.get_compartment()
        compartment.open()
        compartment.mark_free()
        del self.access_token_mapping[access_code.get_code()]

    def open_expired_compartments(self) -> None:
        """Open all compartments with expired access codes"""
        for access_code in self.access_token_mapping.values():
            if access_code.is_expired():
                compartment = access_code.get_compartment()
                compartment.open()

    def __get_expiry_date(self) -> datetime:
        return datetime.datetime.now() + datetime.timedelta(weeks=1)

    def generate_access_code(self, compartment: Compartment) -> AccessCode:
         code = f"{random.randint(0, 999999):06d}"
         expiry_date = self.__get_expiry_date()
         return AccessCode(code, compartment, expiry_date)
