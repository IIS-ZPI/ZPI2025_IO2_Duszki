from abc import ABC, abstractmethod

class IArithmeticsPow(ABC):
    @abstractmethod
    def power(self, A: float, B: float) -> float:
        pass

#Lab1_Task5_KBanaszewskaa_3

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
#Lab1_Task5_3_ninsson
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
#Lab1_Task5_2_ninsson
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
#Lab1_Task5_1_ninsson
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