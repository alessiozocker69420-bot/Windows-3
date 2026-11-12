/**
 * Scientific Calculator
 */
const CalculatorApp = {
  render(container, winId) {
    container.innerHTML = `
      <div class="calc-app">
        <div class="calc-display">
          <div class="calc-expression" id="${winId}_expr"></div>
          <div class="calc-result" id="${winId}_res">0</div>
        </div>
        <div class="calc-buttons">
          <button class="calc-btn fn" data-v="C">C</button>
          <button class="calc-btn fn" data-v="(">(</button>
          <button class="calc-btn fn" data-v=")">)</button>
          <button class="calc-btn op" data-v="/">÷</button>
          <button class="calc-btn" data-v="7">7</button>
          <button class="calc-btn" data-v="8">8</button>
          <button class="calc-btn" data-v="9">9</button>
          <button class="calc-btn op" data-v="*">×</button>
          <button class="calc-btn" data-v="4">4</button>
          <button class="calc-btn" data-v="5">5</button>
          <button class="calc-btn" data-v="6">6</button>
          <button class="calc-btn op" data-v="-">−</button>
          <button class="calc-btn" data-v="1">1</button>
          <button class="calc-btn" data-v="2">2</button>
          <button class="calc-btn" data-v="3">3</button>
          <button class="calc-btn op" data-v="+">+</button>
          <button class="calc-btn zero" data-v="0">0</button>
          <button class="calc-btn" data-v=".">.</button>
          <button class="calc-btn equals" data-v="=">=</button>
          <button class="calc-btn fn" data-v="sqrt">√</button>
          <button class="calc-btn fn" data-v="^">xʸ</button>
          <button class="calc-btn fn" data-v="%">%</button>
          <button class="calc-btn fn" data-v="±">±</button>
        </div>
      </div>
    `;

    let expr = '';
    let display = '0';
    const exprEl = document.getElementById(winId + '_expr');
    const resEl = document.getElementById(winId + '_res');

    const update = () => {
      exprEl.textContent = expr;
      resEl.textContent = display;
    };

    const calculate = (str) => {
      try {
        // Safe eval: only allow numbers and operators
        let s = str
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-')
          .replace(/%/g, '/100')
          .replace(/√\(/g, 'Math.sqrt(')
          .replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)')
          .replace(/\^/g, '**');
        // Basic safety
        if (!/^[0-9+\-*/().%\sMath.sqrt*]+$/.test(s.replace(/Math\.sqrt/g, ''))) {
          // More permissive check
          if (/[^0-9+\-*/().\s]/.test(s.replace(/Math\.sqrt/g, '').replace(/\*\*/g, ''))) {
            throw new Error('Invalid');
          }
        }
        const result = Function('"use strict"; return (' + s + ')')();
        if (typeof result !== 'number' || !isFinite(result)) throw new Error('NaN');
        return result;
      } catch (e) {
        return 'Fehler';
      }
    };

    container.querySelectorAll('.calc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.v;
        if (v === 'C') {
          expr = '';
          display = '0';
        } else if (v === '=') {
          const result = calculate(expr || display);
          display = String(result);
          expr = '';
        } else if (v === '±') {
          if (display !== '0' && display !== 'Fehler') {
            display = display.startsWith('-') ? display.slice(1) : '-' + display;
            if (expr) expr = display;
          }
        } else if (v === 'sqrt') {
          expr = '√(' + (expr || display) + ')';
          const result = calculate(expr);
          display = String(result);
          expr = '';
        } else if (v === '%') {
          expr = (expr || display) + '%';
          display = expr;
        } else if (v === '^') {
          expr = (expr || display) + '^';
          display = expr;
        } else {
          if (display === '0' && v !== '.') {
            display = v;
            expr = v;
          } else if (display === 'Fehler') {
            display = v;
            expr = v;
          } else {
            expr = (expr || display) + v;
            display = expr;
          }
        }
        update();
      });
    });

    // Keyboard support
    const keyHandler = (e) => {
      if (!VirtualPC.windows.get(winId) || VirtualPC.focusedWindow !== winId) return;
      const map = {
        '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
        '.':'.', '+':'+', '-':'-', '*':'*', '/':'/', 'Enter':'=', '=':'=', 'Escape':'C', 'Backspace':'C',
        '(':'(', ')':')', '%':'%'
      };
      if (map[e.key]) {
        e.preventDefault();
        const btn = container.querySelector(`[data-v="${map[e.key]}"]`);
        if (btn) btn.click();
      }
    };
    document.addEventListener('keydown', keyHandler);
    const win = VirtualPC.windows.get(winId);
    if (win) win.cleanup = () => document.removeEventListener('keydown', keyHandler);
  }
};

window.CalculatorApp = CalculatorApp;
