# Cutie Calculator

A beautiful, modern calculator web app built with React frontend and C# .NET 10 backend API.

## Features

### Basic Operations
- Addition, subtraction, multiplication, division
- Floating-point decimal support
- Reset/clear functionality
- Error handling for invalid inputs and division by zero

### Advanced Features
- Square root calculations (√x)
- Logarithm functions (log, ln, log₂)
- Binary/decimal conversion mode
- Pastel color theme with smooth button animations

### UI/UX
- Beautiful pastel gradient background
- Interactive buttons with color transitions on click
- Responsive design
- Clean, modern interface
- Error display for user feedback

## Architecture

### Frontend (React + TypeScript)
- React 18 with TypeScript
- Tailwind CSS for styling
- API integration with C# backend
- Component-based architecture

### Backend (C# .NET 10)
- ASP.NET Core Web API
- RESTful endpoints for calculations
- Comprehensive error handling
- CORS enabled for React frontend
- Swagger documentation

## Getting Started

### Prerequisites
- Node.js and npm
- .NET 10 SDK

### Backend Setup

1. Navigate to the Calculator directory:
   ```bash
   cd Calculator
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Run the API server:
   ```bash
   dotnet run
   ```

   The API will be available at `http://localhost:5000`

4. Access Swagger documentation at `http://localhost:5000/swagger`

### Frontend Setup

1. Navigate to the root directory:
   ```bash
   cd ..
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

   The app will be available at `http://localhost:3000`

## API Endpoints

### Basic Calculations
```
POST /api/calculator/calculate
```
Request body:
```json
{
  "firstOperand": 10,
  "secondOperand": 5,
  "operation": "add" // or "subtract", "multiply", "divide"
}
```

### Advanced Functions
```
POST /api/calculator/advanced
```
Request body:
```json
{
  "function": "sqrt", // or "log", "ln", "log2"
  "operand": 16
}
```

### Binary Conversion
```
POST /api/calculator/binary/convert
```
Request body:
```json
{
  "toBinary": true,
  "value": 10
}
```

### Reset Calculator
```
POST /api/calculator/reset
```

## Project Structure

```
CutieCalculator/
├── Calculator/                    # C# Backend
│   ├── Controllers/
│   │   └── CalculatorController.cs
│   ├── Models/
│   │   ├── CalculationRequest.cs
│   │   ├── CalculationResponse.cs
│   │   ├── AdvancedCalculationRequest.cs
│   │   └── BinaryConversionRequest.cs
│   ├── Program.cs
│   └── Calculator.csproj
├── src/                          # React Frontend
│   ├── components/
│   │   └── Calculator.tsx
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── public/
│   └── index.html
├── package.json
└── README.md
```

## Technologies Used

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Create React App** - Development environment

### Backend
- **ASP.NET Core 10** - Web framework
- **C#** - Programming language
- **Swagger/OpenAPI** - API documentation
- **CORS** - Cross-origin resource sharing

## Usage

1. Start both the backend and frontend servers
2. Open the calculator in your browser
3. Use the number buttons to input values
4. Select operations using the operator buttons
5. Switch between decimal and binary modes using the BIN/DEC button
6. Access advanced functions using the √x, log, ln, and log₂ buttons
7. Clear the calculator using the C button

The calculator provides real-time error feedback and handles all edge cases including division by zero, invalid inputs, and mathematical domain errors.
