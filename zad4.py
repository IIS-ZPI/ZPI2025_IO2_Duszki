from abc import ABC, abstractmethod

# Lab1_Task6_WojciechKorbel
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
    
class IArithmeticsDiff(ABC):
    @abstractmethod
    def difference(self, A: float, B: float) -> float:
        pass

class ArithmeticDiff(IArithmeticsDiff):
    def difference(self, A: float, B: float) -> float:
        return A - B

if __name__ == "__main__":
    # Lab1_Task5_WojciechKorbel_1
    add = ArithmeticAdd()
    diff = ArithmeticDiff()
    mult = ArithmeticMult()
    div = ArithmeticDiv()
    pow_op = ArithmeticPow()
    # Lab1_Task5_WojciechKorbel_2
    a = 10
    b = 5

    print("Addition:", add.addition(a, b))
    print("Difference:", diff.difference(a, b))
    print("Multiplication:", mult.multiplication(a, b))
    print("Division:", div.division(a, b))
    # Lab1_Task5_WojciechKorbel_3
    print("Power:", pow_op.power(a, b))