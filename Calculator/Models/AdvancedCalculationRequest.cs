namespace CalculatorAPI.Models;

public class AdvancedCalculationRequest
{
    public double Operand { get; set; }
    public required string Function { get; set; }
    public double? Base { get; set; } // For logarithm base
}
