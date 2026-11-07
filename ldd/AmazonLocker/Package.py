from Size import Size


class Package:
    """Represents a package that can be stored in a compartment"""

    def __init__(self, size: Size):
        self.size = size

    def get_size(self) -> Size:
        return self.size
