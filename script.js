// Phu AI - Quantum ZX Core Implementation

class PhuAI {
    constructor() {
        this.quantumState = 'Superposition';
        this.entanglement = 81;
        this.optimizationLevel = 81;
        this.phubersProtocol = 'quantum';
        this.quantumBoost = true;
        this.activityLog = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startQuantumCore();
        this.logActivity('Phu AI System Initialized');
        this.logActivity('Phuoptimizer 81 Online');
        this.logActivity('Phubers Protocol: Quantum Mode Active');
        this.logActivity('Quantum ZX Core: Ready');
    }

    setupEventListeners() {
        // Solve button
        document.getElementById('solveBtn').addEventListener('click', () => this.solvePuzzle());
        
        // Enter key in textarea
        document.getElementById('puzzleInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.solvePuzzle();
            }
        });

        // Optimization level slider
        const optLevel = document.getElementById('optLevel');
        optLevel.addEventListener('input', (e) => {
            this.optimizationLevel = e.target.value;
            document.getElementById('optLevelValue').textContent = e.target.value;
            this.updateOptimizerStatus();
        });

        // Quantum boost toggle
        document.getElementById('quantumBoost').addEventListener('change', (e) => {
            this.quantumBoost = e.target.checked;
            this.updateOptimizerStatus();
        });

        // Phubers protocol selector
        document.getElementById('phubersProtocol').addEventListener('change', (e) => {
            this.phubersProtocol = e.target.value;
            this.updateOptimizerStatus();
        });
    }

    startQuantumCore() {
        this.renderQuantumVisualization();
        this.updateQuantumStats();
        
        // Update quantum state periodically
        setInterval(() => {
            this.updateQuantumStats();
        }, 2000);

        // Animate quantum visualization
        setInterval(() => {
            this.renderQuantumVisualization();
        }, 50);
    }

    renderQuantumVisualization() {
        const canvas = document.getElementById('quantumCanvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw quantum particles
        const time = Date.now() / 1000;
        const particles = 81; // Phuoptimizer 81 themed

        for (let i = 0; i < particles; i++) {
            const angle = (i / particles) * Math.PI * 2 + time;
            const radius = 50 + Math.sin(time + i) * 30;
            const x = canvas.width / 2 + Math.cos(angle) * radius;
            const y = canvas.height / 2 + Math.sin(angle) * radius;
            
            const hue = (i / particles) * 360 + time * 50;
            ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();

            // Draw connections
            if (i < particles - 1) {
                const nextAngle = ((i + 1) / particles) * Math.PI * 2 + time;
                const nextX = canvas.width / 2 + Math.cos(nextAngle) * radius;
                const nextY = canvas.height / 2 + Math.sin(nextAngle) * radius;
                
                ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.2)`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(nextX, nextY);
                ctx.stroke();
            }
        }

        // Draw center core
        ctx.fillStyle = '#1bffff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#1bffff';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 10 + Math.sin(time * 2) * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    updateQuantumStats() {
        // Simulate quantum state changes
        const states = ['Superposition', 'Entangled', 'Coherent', 'Optimized'];
        this.quantumState = states[Math.floor(Math.random() * states.length)];
        document.getElementById('quantumState').textContent = this.quantumState;

        // Update entanglement
        this.entanglement = 75 + Math.floor(Math.random() * 15);
        document.getElementById('entanglement').textContent = this.entanglement + '%';

        // Generate future prediction
        const predictions = [
            'Positive Outcome',
            'High Efficiency',
            'Optimal Solution',
            'Quantum Advantage',
            'Peak Performance',
            'Success Probability: 81%'
        ];
        document.getElementById('prediction').textContent = 
            predictions[Math.floor(Math.random() * predictions.length)];
    }

    solvePuzzle() {
        const input = document.getElementById('puzzleInput').value.trim();
        
        if (!input) {
            this.showOutput('Please enter a puzzle or problem to solve.', 'error');
            return;
        }

        this.logActivity(`Processing: ${input.substring(0, 50)}...`);
        this.showOutput('🔮 Phu AI is analyzing with Quantum ZX Core...', 'processing');

        // Simulate processing time
        setTimeout(() => {
            const solution = this.generateSolution(input);
            this.showOutput(solution, 'success');
            this.logActivity('Solution generated successfully');
        }, 1500);
    }

    generateSolution(input) {
        const lowerInput = input.toLowerCase();

        // Math problems
        if (lowerInput.includes('+') || lowerInput.includes('plus')) {
            return this.solveMath(input, '+');
        }
        if (lowerInput.includes('-') || lowerInput.includes('minus')) {
            return this.solveMath(input, '-');
        }
        if (lowerInput.includes('*') || lowerInput.includes('×') || lowerInput.includes('times')) {
            return this.solveMath(input, '*');
        }
        if (lowerInput.includes('/') || lowerInput.includes('÷') || lowerInput.includes('divided')) {
            return this.solveMath(input, '/');
        }

        // Fibonacci
        if (lowerInput.includes('fibonacci')) {
            const n = this.extractNumber(input);
            if (n !== null) {
                return this.solveFibonacci(n);
            }
        }

        // Prime numbers
        if (lowerInput.includes('prime')) {
            const n = this.extractNumber(input);
            if (n !== null) {
                return this.solvePrime(n);
            }
        }

        // Factorial
        if (lowerInput.includes('factorial')) {
            const n = this.extractNumber(input);
            if (n !== null) {
                return this.solveFactorial(n);
            }
        }

        // Pattern recognition
        if (lowerInput.includes('pattern') || lowerInput.includes('sequence')) {
            return this.analyzePattern(input);
        }

        // Future prediction
        if (lowerInput.includes('future') || lowerInput.includes('predict')) {
            return this.predictFuture(input);
        }

        // Default quantum analysis
        return this.quantumAnalysis(input);
    }

    solveMath(input, operator) {
        const numbers = input.match(/-?\d+\.?\d*/g);
        if (numbers && numbers.length >= 2) {
            const a = parseFloat(numbers[0]);
            const b = parseFloat(numbers[1]);
            let result;
            
            switch(operator) {
                case '+':
                    result = a + b;
                    break;
                case '-':
                    result = a - b;
                    break;
                case '*':
                    result = a * b;
                    break;
                case '/':
                    if (b === 0) {
                        return `
                            <h3>❌ Error</h3>
                            <p><strong>Cannot divide by zero</strong></p>
                            <p>Division by zero is undefined in mathematics.</p>
                            <p><strong>Phu AI Suggestion:</strong> Please check your input values.</p>
                        `;
                    }
                    result = a / b;
                    break;
            }

            return `
                <h3>✅ Solution Found!</h3>
                <p><strong>Calculation:</strong> ${a} ${operator} ${b} = ${result}</p>
                <p><strong>Phuoptimizer 81 Analysis:</strong> Optimized at level ${this.optimizationLevel}</p>
                <p><strong>Quantum Confidence:</strong> ${this.entanglement}%</p>
                <p><strong>Phubers Protocol:</strong> ${this.phubersProtocol.toUpperCase()} mode active</p>
            `;
        }
        return this.quantumAnalysis(input);
    }

    solveFibonacci(n) {
        if (n < 0 || n > 50) {
            return `<p>Please enter a number between 0 and 50 for Fibonacci calculation.</p>`;
        }

        const fib = (num) => {
            if (num <= 1) return num;
            let a = 0, b = 1;
            for (let i = 2; i <= num; i++) {
                [a, b] = [b, a + b];
            }
            return b;
        };

        const result = fib(n);
        const sequence = [];
        for (let i = 0; i <= Math.min(n, 10); i++) {
            sequence.push(fib(i));
        }

        return `
            <h3>✅ Fibonacci Solution</h3>
            <p><strong>Fibonacci(${n}):</strong> ${result}</p>
            <p><strong>Sequence:</strong> ${sequence.join(', ')}${n > 10 ? '...' : ''}</p>
            <p><strong>Quantum ZX Core:</strong> Calculated using ${this.phubersProtocol} acceleration</p>
            <p><strong>Processing Power:</strong> Phuoptimizer 81 at level ${this.optimizationLevel}</p>
        `;
    }

    solvePrime(n) {
        if (n < 2) {
            return `<p>${n} is not a prime number.</p>`;
        }

        const isPrime = (num) => {
            for (let i = 2; i <= Math.sqrt(num); i++) {
                if (num % i === 0) return false;
            }
            return true;
        };

        const result = isPrime(n);
        
        return `
            <h3>✅ Prime Number Analysis</h3>
            <p><strong>${n}</strong> is ${result ? '' : 'NOT '}a prime number</p>
            <p><strong>Quantum Verification:</strong> ${this.quantumBoost ? 'Enhanced' : 'Standard'} mode</p>
            <p><strong>Phuoptimizer 81:</strong> Analysis complete</p>
        `;
    }

    solveFactorial(n) {
        if (n < 0 || n > 20) {
            return `<p>Please enter a number between 0 and 20 for factorial calculation.</p>`;
        }

        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }

        return `
            <h3>✅ Factorial Solution</h3>
            <p><strong>${n}!:</strong> ${result.toLocaleString()}</p>
            <p><strong>Quantum Processing:</strong> ${this.entanglement}% entanglement utilized</p>
            <p><strong>Phubers Enhancement:</strong> Active</p>
        `;
    }

    analyzePattern(input) {
        return `
            <h3>✅ Pattern Analysis</h3>
            <p><strong>Input:</strong> ${input}</p>
            <p><strong>Quantum ZX Core Analysis:</strong> Pattern detected and analyzed</p>
            <p><strong>Pattern Type:</strong> Complex sequential structure</p>
            <p><strong>Optimization:</strong> Phuoptimizer 81 suggests recursive approach</p>
            <p><strong>Confidence:</strong> ${this.entanglement}%</p>
        `;
    }

    predictFuture(input) {
        const predictions = [
            'High probability of success in your endeavors',
            'Quantum fluctuations indicate positive outcomes',
            'The ZX Core predicts optimal results within 81 time units',
            'Entanglement patterns suggest favorable circumstances',
            'Future state: Coherent and optimized',
            'Timeline convergence shows successful pathway'
        ];
        
        const prediction = predictions[Math.floor(Math.random() * predictions.length)];

        return `
            <h3>🔮 Future Prediction</h3>
            <p><strong>Query:</strong> ${input}</p>
            <p><strong>Quantum ZX Core Prediction:</strong> ${prediction}</p>
            <p><strong>Confidence Level:</strong> ${this.entanglement}%</p>
            <p><strong>Time Horizon:</strong> ${Math.floor(Math.random() * 365)} days</p>
            <p><strong>Phuoptimizer 81 Status:</strong> Calculation verified</p>
            <p><em>Note: Predictions based on quantum probability analysis</em></p>
        `;
    }

    quantumAnalysis(input) {
        const analyses = [
            'Your input has been processed through the Quantum ZX Core',
            'Phu AI has analyzed the problem using quantum entanglement',
            'The Phuoptimizer 81 suggests a multi-dimensional approach',
            'Quantum superposition indicates multiple valid solutions',
            'ZX Core has identified optimal pathways'
        ];

        const analysis = analyses[Math.floor(Math.random() * analyses.length)];

        return `
            <h3>🧠 Phu AI Analysis</h3>
            <p><strong>Input:</strong> ${input}</p>
            <p><strong>Analysis:</strong> ${analysis}</p>
            <p><strong>Quantum State:</strong> ${this.quantumState}</p>
            <p><strong>Entanglement:</strong> ${this.entanglement}%</p>
            <p><strong>Optimization Level:</strong> ${this.optimizationLevel}/81</p>
            <p><strong>Phubers Protocol:</strong> ${this.phubersProtocol.toUpperCase()}</p>
            <p><strong>Recommendation:</strong> Continue with quantum-enhanced approach</p>
        `;
    }

    extractNumber(text) {
        const match = text.match(/\d+/);
        return match ? parseInt(match[0]) : null;
    }

    showOutput(content, type) {
        const output = document.getElementById('solutionOutput');
        output.innerHTML = content;
        output.classList.add('visible');
        
        if (type === 'error') {
            output.style.borderLeftColor = '#dc3545';
        } else if (type === 'success') {
            output.style.borderLeftColor = '#28a745';
        } else {
            output.style.borderLeftColor = '#2e3192';
        }
    }

    updateOptimizerStatus() {
        const status = document.getElementById('optimizerStatus');
        status.textContent = `Status: Optimization Level ${this.optimizationLevel} | ` +
                           `Quantum Boost: ${this.quantumBoost ? 'ON' : 'OFF'} | ` +
                           `Protocol: ${this.phubersProtocol.toUpperCase()}`;
        
        this.logActivity(`Configuration updated: Level ${this.optimizationLevel}, ${this.phubersProtocol} protocol`);
    }

    logActivity(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.activityLog.unshift(`[${timestamp}] ${message}`);
        
        // Keep only last 20 entries
        if (this.activityLog.length > 20) {
            this.activityLog = this.activityLog.slice(0, 20);
        }

        this.updateActivityLog();
    }

    updateActivityLog() {
        const logBox = document.getElementById('activityLog');
        logBox.innerHTML = this.activityLog
            .map(entry => `<div class="log-entry">${entry}</div>`)
            .join('');
    }
}

// Initialize Phu AI when page loads
window.addEventListener('DOMContentLoaded', () => {
    const phuAI = new PhuAI();
    
    console.log('🧠 Phu AI initialized successfully!');
    console.log('Phuoptimizer 81 & Phubers integration active');
    console.log('Quantum ZX Core online');
});
