from abc import ABC, abstractmethod

class IArithmeticsPow(ABC):
    @abstractmethod
    def power(self, A: float, B: float) -> float:
        pass
      
class ArithmeticPow(IArithmeticsPow):
    def power(self, A: float, B: float) -> float:
        return A ** B
      
class IArithmeticsDiv(ABC):
    @abstractmethod
    def division(self, A: float, B: float) -> float:
        pass

class ArithmeticDiv(IArithmeticsDiv):
    def division(self, A: float, B: float) -> float:
        if B == 0:
            raise ValueError("Division by zero")
        return A / B
      
class IArithmeticsAdd(ABC):
    @abstractmethod
    def addition(self, A: float, B: float) -> float:
        pass

class ArithmeticAdd(IArithmeticsAdd):
    def addition(self, A: float, B: float) -> float:
        return A + B
      
class IArithmeticsMult(ABC):
    @abstractmethod
    def multiplication(self, A: float, B: float) -> float:
        pass

class ArithmeticMult(IArithmeticsMult):
    def multiplication(self, A: float, B: float) -> float:
        return A * B
    
class IArithmeticsDiff(ABC): #Lab1_Task5_ziomciopoziomcio_3
    @abstractmethod
    def difference(self, A: float, B: float) -> float:
        pass

class ArithmeticDiff(IArithmeticsDiff): #Lab1_Task6_ziomciopoziomcio
    def difference(self, A: float, B: float) -> float:
        return A - B

if __name__ == "__main__":
    add = ArithmeticAdd()
    diff = ArithmeticDiff()
    mult = ArithmeticMult()
    div = ArithmeticDiv()
    pow_op = ArithmeticPow()

    a = 10
    b = 5

    print("Addition:", add.addition(a, b))
    print("Difference:", diff.difference(a, b))
    print("Multiplication:", mult.multiplication(a, b))
    print("Division:", div.division(a, b))
    print("Power:", pow_op.power(a, b))