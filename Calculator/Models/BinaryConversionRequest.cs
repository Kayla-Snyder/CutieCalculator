namespace CalculatorAPI.Models;

public class BinaryConversionRequest
{
    public bool ToBinary { get; set; }
    public double Value { get; set; }
    public string? BinaryValue { get; set; }
}
