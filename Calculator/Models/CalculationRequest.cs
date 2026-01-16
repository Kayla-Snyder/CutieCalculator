namespace CalculatorAPI.Models;

public class CalculationRequest
{
    public double FirstOperand { get; set; }
    public double SecondOperand { get; set; }
    public required string Operation { get; set; }
}
