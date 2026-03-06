from abc import ABC, abstractmethod

class IArithmeticsAdd(ABC):
    @abstractmethod
    def addition(self, A: float, B: float) -> float:
        pass

class ArithmeticAdd(IArithmeticsAdd):
    def addition(self, A: float, B: float) -> float:
        return A + B