from abc import ABC, abstractmethod

class IArithmeticsDiff(ABC):

    @abstractmethod
    def difference(self, A: float, B: float) -> float:
        pass

class ArithmeticDiff(IArithmeticsDiff):

    def difference(self, A: float, B: float) -> float:
        return A - B