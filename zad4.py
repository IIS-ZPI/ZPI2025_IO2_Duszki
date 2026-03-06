from abc import ABC, abstractmethod

class IArithmeticsPow(ABC):

    @abstractmethod
    def power(self, A: float, B: float) -> float:
        pass
class ArithmeticPow(IArithmeticsPow):

    def power(self, A: float, B: float) -> float:
        return A ** B
