import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:5000/api/calculator';

export default function Calculator() {
    const [display, setDisplay] = useState('0');
    const [firstOperand, setFirstOperand] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
    const [error, setError] = useState('');
    const [mode, setMode] = useState<'decimal' | 'binary'>('decimal');

    const inputDigit = async (digit: string) => {
        setError('');

        if (mode === 'binary' && digit !== '0' && digit !== '1') {
            setError('Binary mode only accepts 0 and 1');
            return;
        }

        if (waitingForSecondOperand) {
            setDisplay(String(digit));
            setWaitingForSecondOperand(false);
        } else {
            setDisplay(display === '0' ? String(digit) : display + digit);
        }
    };

    const inputDecimal = () => {
        if (mode === 'binary') {
            setError('Decimals not allowed in binary mode');
            return;
        }

        setError('');
        if (waitingForSecondOperand) {
            setDisplay('0.');
            setWaitingForSecondOperand(false);
        } else if (display.indexOf('.') === -1) {
            setDisplay(display + '.');
        }
    };

    const clear = () => {
        setDisplay('0');
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(false);
        setError('');
    };

    const toggleMode = async () => {
        try {
            const currentValue = parseFloat(display);
            
            if (mode === 'decimal') {
                if (currentValue < 0 || !Number.isInteger(currentValue)) {
                    setError('Only positive integers can be converted to binary');
                    return;
                }
                
                const response = await fetch(`${API_BASE_URL}/binary/convert`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        toBinary: true,
                        value: currentValue
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    setDisplay(data.result);
                    setMode('binary');
                    setError('');
                } else {
                    setError(data.errorMessage);
                }
            } else {
                const response = await fetch(`${API_BASE_URL}/binary/convert`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        toBinary: false,
                        binaryValue: display
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    setDisplay(data.result);
                    setMode('decimal');
                    setError('');
                } else {
                    setError(data.errorMessage);
                }
            }
        } catch (e) {
            setError('API connection error');
        }
    };

    const performSquareRoot = async () => {
        try {
            const inputValue = mode === 'binary' ? parseInt(display, 2) : parseFloat(display);

            if (isNaN(inputValue)) {
                setError('Invalid input');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/advanced`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    function: 'sqrt',
                    operand: inputValue
                })
            });

            const data = await response.json();
            
            if (data.success) {
                if (mode === 'binary') {
                    if (!Number.isInteger(data.result)) {
                        setError('Result is not an integer, switching to decimal mode');
                        setMode('decimal');
                    }
                    setDisplay(Number.isInteger(data.result) ? Math.floor(data.result).toString(2) : String(data.result));
                } else {
                    setDisplay(String(data.result));
                }
                setError('');
            } else {
                setError(data.errorMessage);
            }
        } catch (e) {
            setError('API connection error');
        }
    };

    const performLogarithm = async (base: number | 'e') => {
        try {
            const inputValue = mode === 'binary' ? parseInt(display, 2) : parseFloat(display);

            if (isNaN(inputValue)) {
                setError('Invalid input');
                return;
            }

            let functionName: string;
            if (base === 10) {
                functionName = 'log';
            } else if (base === 'e') {
                functionName = 'ln';
            } else {
                functionName = 'log2';
            }

            const response = await fetch(`${API_BASE_URL}/advanced`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    function: functionName,
                    operand: inputValue
                })
            });

            const data = await response.json();
            
            if (data.success) {
                if (mode === 'binary') {
                    setError('Logarithm result in decimal mode');
                    setMode('decimal');
                }
                setDisplay(String(data.result));
                setError('');
            } else {
                setError(data.errorMessage);
            }
        } catch (e) {
            setError('API connection error');
        }
    };

    const performOperation = async (nextOperator: string) => {
        const inputValue = mode === 'binary' ? parseInt(display, 2) : parseFloat(display);

        if (isNaN(inputValue)) {
            setError('Invalid input');
            return;
        }

        if (firstOperand === null) {
            setFirstOperand(inputValue);
        } else if (operator) {
            try {
                const response = await fetch(`${API_BASE_URL}/calculate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        firstOperand: firstOperand,
                        secondOperand: inputValue,
                        operation: operator
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    const displayValue = mode === 'binary' ?
                        (Number.isInteger(data.result) ? Math.floor(data.result).toString(2) : (() => {
                            setMode('decimal');
                            return String(data.result);
                        })()) :
                        String(data.result);

                    setDisplay(displayValue);
                    setFirstOperand(data.result);
                    setError('');
                } else {
                    setError(data.errorMessage);
                    setDisplay('0');
                    setFirstOperand(null);
                    setOperator(null);
                    setWaitingForSecondOperand(false);
                    return;
                }
            } catch (e) {
                setError('API connection error');
                return;
            }
        }

        setWaitingForSecondOperand(true);
        setOperator(nextOperator);
    };

    const handleEquals = async () => {
        if (operator && firstOperand !== null) {
            await performOperation('=');
            setOperator(null);
        }
    };

    const buttonStyle = {
        width: '100%',
        height: '64px',
        borderRadius: '12px',
        fontWeight: '600',
        fontSize: '16px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fce7f3 0%, #e0e7ff 50%, #fef3c7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    };

    const calculatorStyle = {
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        padding: '24px',
        width: '100%',
        maxWidth: '448px'
    };

    const displayStyle = {
        background: 'linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%)',
        borderRadius: '16px',
        padding: '24px',
        minHeight: '96px',
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginBottom: '16px'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px'
    };

    return (
        <div style={containerStyle}>
            <div style={calculatorStyle}>
                <div style={displayStyle}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#4b5563', background: 'rgba(255, 255, 255, 0.7)', padding: '4px 8px', borderRadius: '4px' }}>
                            {mode === 'binary' ? 'BINARY' : 'DECIMAL'}
                        </span>
                    </div>
                    {error && (
                        <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '8px', width: '100%', textAlign: 'right' }}>
                            {error}
                        </div>
                    )}
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', wordBreak: 'break-all' }}>
                        {display}
                    </div>
                </div>

                <div style={gridStyle}>
                    {/* Row 1 */}
                    <button
                        onClick={clear}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #fecaca 0%, #fbcfe8 100%)',
                            color: '#374151'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        C
                    </button>
                    <button
                        onClick={toggleMode}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #ddd6fe 0%, #f3e8ff 100%)',
                            color: '#374151',
                            fontSize: '14px'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {mode === 'binary' ? 'DEC' : 'BIN'}
                    </button>
                    <button
                        onClick={performSquareRoot}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #a7f3d0 0%, #ccfbf1 100%)',
                            color: '#374151',
                            fontSize: '14px'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        √x
                    </button>
                    <button
                        onClick={() => performLogarithm(10)}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #a7f3d0 0%, #ccfbf1 100%)',
                            color: '#374151',
                            fontSize: '14px'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        log
                    </button>
                    <button
                        onClick={() => performOperation('/')}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #fed7aa 0%, #fef3c7 100%)',
                            color: '#374151'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        ÷
                    </button>

                    {/* Row 2 */}
                    <button
                        onClick={() => inputDigit('7')}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #bfdbfe 0%, #ddd6fe 100%)',
                            color: '#374151'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        7
                    </button>
                    <button
                        onClick={() => inputDigit('8')}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #bfdbfe 0%, #ddd6fe 100%)',
                            color: '#374151'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        8
                    </button>
                    <button
                        onClick={() => inputDigit('9')}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #bfdbfe 0%, #ddd6fe 100%)',
                            color: '#374151'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        9
                    </button>
                    <button
                        onClick={() => performLogarithm('e')}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #a7f3d0 0%, #ccfbf1 100%)',
                            color: '#374151',
                            fontSize: '14px'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        ln
                    </button>
                    <button
                        onClick={() => performOperation('*')}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #fed7aa 0%, #fef3c7 100%)',
                            color: '#374151'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        ×
                    </button>

                    {/* Row 3 */}
                    <button
                        onClick={() => inputDigit('4')}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #bfdbfe 0%, #ddd6fe 100%)',
                            color: '#374151'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        4
                    </button>
                    <button
                        onClick={() => inputDigit('5')}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #bfdbfe 0%, #ddd6fe 100%)',
                            color: '#374151'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        5
                    </button>
                    <button
                        onClick={() => inputDigit('6')}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #bfdbfe 0%, #ddd6fe 100%)',
                            color: '#374151'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        6
                    </button>
                    <button
                        onClick={() => performLogarithm(2)}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #a7f3d0 0%, #ccfbf1 100%)',
                            color: '#374151',
                            fontSize: '14px'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        log₂
                    </button>
                    <button
                        onClick={() => performOperation('-')}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #fed7aa 0%, #fef3c7 100%)',
                            color: '#374151'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        −
                    </button>

                    {/* Row 4 */}
                    <button
                        onClick={() => inputDigit('1')}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #bfdbfe 0%, #ddd6fe 100%)',
                            color: '#374151'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        1
                    </button>
                    <button
                        onClick={() => inputDigit('2')}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #bfdbfe 0%, #ddd6fe 100%)',
                            color: '#374151'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        2
                    </button>
                    <button
                        onClick={() => inputDigit('3')}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #bfdbfe 0%, #ddd6fe 100%)',
                            color: '#374151'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        3
                    </button>
                    <button
                        onClick={inputDecimal}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #bfdbfe 0%, #ddd6fe 100%)',
                            color: '#374151'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        .
                    </button>
                    <button
                        onClick={() => performOperation('+')}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #fed7aa 0%, #fef3c7 100%)',
                            color: '#374151'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        +
                    </button>

                    {/* Row 5 */}
                    <button
                        onClick={() => inputDigit('0')}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #bfdbfe 0%, #ddd6fe 100%)',
                            color: '#374151',
                            gridColumn: 'span 4'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        0
                    </button>
                    <button
                        onClick={handleEquals}
                        style={{
                            ...buttonStyle,
                            background: 'linear-gradient(135deg, #bbf7d0 0%, #a7f3d0 100%)',
                            color: '#374151'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        =
                    </button>
                </div>
            </div>
        </div>
    );
}
