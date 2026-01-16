namespace CalculatorAPI.Models;

public class CalculationResponse
{
    public double? Result { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
}
