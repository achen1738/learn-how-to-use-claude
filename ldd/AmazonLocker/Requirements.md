# Premise

"Design a locker system like Amazon Locker where delivery drivers can deposit packages and customers can pick them up using a code."

# Requirements

- Must be able to deliver packages of different sizer
- 1 package per locker, and one access token per package
- Packages can only go into lockers of their size
- Customers can have multiple packages, and they can vary between sizes small, medium, and large
- Don't worry about lockout, let infinite retries if they attempt the wrong code
- If the locker is full, just somehow deny the worker, and have them reroute to a different locker
- Don't worry about access code delivery, just assume every customer has their own, so just return it
- Access tokens have a TTL of 7 days, after they are explired they cant be opened
  - Staff has to physically remove them and send them to the sender
- Access tokens need clear error messages:
  - Already used
  - Wrong code
  - Expired

# Entities

- Amazon Locker
  - compartments: Compartments[]
    getLargeCompartment
    getMediumCompartment
    getSmallCompartment
    storePackage(size) -> accessCode
    unlockCompartment(accessCode)
    openExpiredCompartments()

- Compartment (individual)
  id: number
  size: Size
  package: Package
  state: CompartmentState - Empty - Locked - Unlocked

  isOccupied() -> boolean
  open(access_code: AccessCode) -> void
  markFree() -> void
  markOccupied() -> void
  getSize() -> Size

- Package
  Enum size
- AccessCode
  code: string
  compartment: Compartment
  expiryDate: timestamp

  isExpired()
  getCompartment()
  getCode()
