
from dataclasses import dataclass, field
from decimal import Decimal
import threading
import time
import uuid
from decimal import Decimal, ROUND_HALF_UP

CENT = Decimal("0.01")
SECONDS_PER_HOUR = Decimal(3600)

@dataclass(frozen=True)
class Delivery:
    driverId: str
    startTime: int
    endTime: int
    hourlyRate: Decimal
    delivery_id: uuid.UUID = field(default_factory=uuid.uuid4)
    cost: Decimal = field(init=False)

    def __post_init__(self):
        object.__setattr__(self, "cost", self.calculateCost())
        
    def calculateCost(self) -> Decimal:
        seconds = Decimal(self.endTime - self.startTime)
        cost = self.hourlyRate * seconds / SECONDS_PER_HOUR
        return cost.quantize(CENT, rounding=ROUND_HALF_UP)
                             
@dataclass(frozen=True)
class Driver:
    driverId: str
    hourlyRate: Decimal


class DeliverySystem:
    def __init__(self):
        self._drivers: dict[str, Driver] = {}
        self._drivers_lock = threading.Lock()


        self._delivery_lock = threading.Lock()
        self._unpaid_deliveries: dict[uuid.UUID, Delivery] = {}

        self._paid_deliveries:dict[uuid.UUID, Delivery] = {}

        self.total_cost: Decimal = Decimal(0)
        self.unpaid_cost: Decimal = Decimal(0)

    def addDriver(self, driverId, usdHourlyRate):
        with self._drivers_lock:
            self._drivers[driverId] = Driver(driverId=driverId, hourlyRate=Decimal(str(usdHourlyRate)))


    def recordDelivery(self, driverId, startTime, endTime):
        with self._drivers_lock:
            if driverId not in self._drivers:
                raise ValueError(f"Driver {driverId} not found.")
            hourlyRate = self._drivers[driverId].hourlyRate

        with self._delivery_lock:            
            delivery = Delivery(driverId=driverId, startTime=startTime, endTime=endTime, hourlyRate=hourlyRate)
            cost = delivery.cost
            self.total_cost += cost
            self.unpaid_cost += cost        
            self._unpaid_deliveries[delivery.delivery_id] = delivery

    # Whole-delivery payment 
    def payUpTo(self, paytime: int):
        deliveries_to_delete = []

        with self._delivery_lock:
            for delivery_id, delivery in self._unpaid_deliveries.items():
                if delivery.endTime <= paytime:
                    self._paid_deliveries[delivery_id] = delivery
                    self.unpaid_cost -= delivery.cost
                    deliveries_to_delete.append(delivery_id)
            for delivery_id in deliveries_to_delete:
                del self._unpaid_deliveries[delivery_id]

    def getTotalCost(self):
        return self.total_cost 

    def getTotalUnpaid(self):
        return self.unpaid_cost 

    def maxSimultaneousDriversInPast24Hours(self):
        deliveries = []

        with self._delivery_lock:
            now = time.time() 
            for delivery in reversed(self._unpaid_deliveries.values()):
                if delivery.endTime >= (now - 24 * 3600):
                    deliveries.append((delivery.startTime, delivery.endTime))

            for delivery in reversed(self._paid_deliveries.values()):
                if delivery.endTime >= (now - 24 * 3600):
                    deliveries.append((delivery.startTime, delivery.endTime))

        events = []
        for delivery in deliveries:
            delivery_start, delivery_end = delivery.startTime, delivery.endTime
            events.append((delivery_start, 1))  # 1 indicates a delivery start
            events.append((delivery_end, -1))  # -1 indicates a delivery end

        # Sort by time. If times are equal, process end (-1) before start (+1)
        events.sort(key=lambda x: (x[0], x[1]))

        max_overlap = 0
        current_overlap = 0

        for time, change in events:
            current_overlap += change
            max_overlap = max(max_overlap, current_overlap)

        return max_overlap