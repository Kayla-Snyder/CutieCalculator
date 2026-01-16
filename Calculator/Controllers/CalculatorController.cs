using Microsoft.AspNetCore.Mvc;
using CalculatorAPI.Models;

namespace CalculatorAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CalculatorController : ControllerBase
{
    [HttpPost("calculate")]
    public ActionResult<CalculationResponse> Calculate([FromBody] CalculationRequest request)
    {
        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Operation))
            {
                return BadRequest(new CalculationResponse
                {
                    Success = false,
                    ErrorMessage = "Operation is required"
                });
            }

            if (double.IsNaN(request.FirstOperand) || double.IsNaN(request.SecondOperand))
            {
                return BadRequest(new CalculationResponse
                {
                    Success = false,
                    ErrorMessage = "Invalid number input"
                });
            }

            if (double.IsInfinity(request.FirstOperand) || double.IsInfinity(request.SecondOperand))
            {
                return BadRequest(new CalculationResponse
                {
                    Success = false,
                    ErrorMessage = "Number is too large"
                });
            }

            double result = request.Operation.ToLower() switch
            {
                "add" or "+" => request.FirstOperand + request.SecondOperand,
                "subtract" or "-" => request.FirstOperand - request.SecondOperand,
                "multiply" or "*" => request.FirstOperand * request.SecondOperand,
                "divide" or "/" => request.SecondOperand == 0 
                    ? throw new DivideByZeroException("Cannot divide by zero")
                    : request.FirstOperand / request.SecondOperand,
                _ => throw new ArgumentException("Invalid operation. Supported operations: add, subtract, multiply, divide")
            };

            // Check for overflow
            if (double.IsInfinity(result))
            {
                return BadRequest(new CalculationResponse
                {
                    Success = false,
                    ErrorMessage = "Result is too large"
                });
            }

            return Ok(new CalculationResponse
            {
                Result = result,
                Success = true
            });
        }
        catch (DivideByZeroException ex)
        {
            return BadRequest(new CalculationResponse
            {
                Success = false,
                ErrorMessage = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new CalculationResponse
            {
                Success = false,
                ErrorMessage = ex.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new CalculationResponse
            {
                Success = false,
                ErrorMessage = $"An error occurred: {ex.Message}"
            });
        }
    }

    [HttpPost("advanced")]
    public ActionResult<CalculationResponse> AdvancedCalculation([FromBody] AdvancedCalculationRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Function))
            {
                return BadRequest(new CalculationResponse
                {
                    Success = false,
                    ErrorMessage = "Function is required"
                });
            }

            if (double.IsNaN(request.Operand) || double.IsInfinity(request.Operand))
            {
                return BadRequest(new CalculationResponse
                {
                    Success = false,
                    ErrorMessage = "Invalid number input"
                });
            }

            double result = request.Function.ToLower() switch
            {
                "sqrt" => request.Operand < 0
                    ? throw new ArgumentException("Cannot calculate square root of negative number")
                    : Math.Sqrt(request.Operand),
                "log10" or "log" => request.Operand <= 0
                    ? throw new ArgumentException("Logarithm only works with positive numbers")
                    : Math.Log10(request.Operand),
                "ln" or "loge" => request.Operand <= 0
                    ? throw new ArgumentException("Logarithm only works with positive numbers")
                    : Math.Log(request.Operand),
                "log2" => request.Operand <= 0
                    ? throw new ArgumentException("Logarithm only works with positive numbers")
                    : Math.Log2(request.Operand),
                _ => throw new ArgumentException("Invalid function. Supported functions: sqrt, log, ln, log2")
            };

            if (double.IsInfinity(result) || double.IsNaN(result))
            {
                return BadRequest(new CalculationResponse
                {
                    Success = false,
                    ErrorMessage = "Result is invalid"
                });
            }

            return Ok(new CalculationResponse
            {
                Result = result,
                Success = true
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new CalculationResponse
            {
                Success = false,
                ErrorMessage = ex.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new CalculationResponse
            {
                Success = false,
                ErrorMessage = $"An error occurred: {ex.Message}"
            });
        }
    }

    [HttpPost("binary/convert")]
    public ActionResult<object> ConvertBinary([FromBody] BinaryConversionRequest request)
    {
        try
        {
            if (request.ToBinary)
            {
                if (request.Value < 0 || request.Value != Math.Floor(request.Value))
                {
                    return BadRequest(new { success = false, errorMessage = "Only positive integers can be converted to binary" });
                }
                
                var binary = Convert.ToString((int)request.Value, 2);
                return Ok(new { success = true, result = binary, isBinary = true });
            }
            else
            {
                var decimal_value = Convert.ToInt32(request.BinaryValue, 2);
                return Ok(new { success = true, result = decimal_value.ToString(), isBinary = false });
            }
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, errorMessage = $"Conversion error: {ex.Message}" });
        }
    }

    [HttpPost("reset")]
    public ActionResult<object> Reset()
    {
        return Ok(new { message = "Calculator reset successfully", success = true });
    }
}
