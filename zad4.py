from abc import ABC, abstractmethod

class IArithmeticsMult(ABC):

    @abstractmethod
    def multiplication(self, A: float, B: float) -> float:
        pass

class ArithmeticMult(IArithmeticsMult):

    def multiplication(self, A: float, B: float) -> float:
        return A * B
    
class IArithmeticsDiff(ABC):

    @abstractmethod
    def difference(self, A: float, B: float) -> float:
        pass

class ArithmeticDiff(IArithmeticsDiff):

    def difference(self, A: float, B: float) -> float:
        return A - B
