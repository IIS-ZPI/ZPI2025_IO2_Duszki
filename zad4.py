from abc import ABC, abstractmethod

class IArithmeticsDiv(ABC):

    @abstractmethod
    def division(self, A: float, B: float) -> float:
        pass

class ArithmeticDiv(IArithmeticsDiv):

    def division(self, A: float, B: float) -> float:
        if B == 0:
            raise ValueError("Division by zero")
        return A / B
