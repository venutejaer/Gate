/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, RotateCcw, Calculator as CalcIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GateCalculator: React.FC<Props> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState<string>('0');
  const [memory, setMemory] = useState<number>(0);
  const [isRad, setIsRad] = useState<boolean>(true);
  const [history, setHistory] = useState<string>('');

  if (!isOpen) return null;

  const handleNum = (n: string) => {
    setDisplay(prev => (prev === '0' || prev === 'Error' ? n : prev + n));
  };

  const handleOp = (op: string) => {
    setHistory(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setHistory('');
  };

  const handleBackspace = () => {
    setDisplay(prev => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
  };

  const handleCalculate = () => {
    try {
      const fullExp = (history + display)
        .replace(/×/g, '*')
        .replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const result = Function(`"use strict"; return (${fullExp})`)();
      setDisplay(String(Number(result.toFixed(8))));
      setHistory('');
    } catch {
      setDisplay('Error');
    }
  };

  const handleUnary = (fn: string) => {
    try {
      const v = parseFloat(display);
      let res = 0;
      const angle = isRad ? v : (v * Math.PI) / 180;

      switch (fn) {
        case 'sin': res = Math.sin(angle); break;
        case 'cos': res = Math.cos(angle); break;
        case 'tan': res = Math.tan(angle); break;
        case 'asin': res = isRad ? Math.asin(v) : (Math.asin(v) * 180) / Math.PI; break;
        case 'acos': res = isRad ? Math.acos(v) : (Math.acos(v) * 180) / Math.PI; break;
        case 'atan': res = isRad ? Math.atan(v) : (Math.atan(v) * 180) / Math.PI; break;
        case 'ln': res = Math.log(v); break;
        case 'log': res = Math.log10(v); break;
        case 'exp': res = Math.exp(v); break;
        case 'sqrt': res = Math.sqrt(v); break;
        case 'sqr': res = v * v; break;
        case 'inv': res = 1 / v; break;
        case 'neg': res = -v; break;
        default: break;
      }
      setDisplay(String(Number(res.toFixed(8))));
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <CalcIcon className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-100">Official GATE Virtual Calculator</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRad(!isRad)}
              className={`px-2 py-0.5 text-xs font-semibold rounded border transition-colors ${
                isRad 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}
            >
              {isRad ? 'RAD' : 'DEG'}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Display */}
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <div className="text-right text-xs font-mono text-slate-400 h-5 overflow-hidden">
            {history}
          </div>
          <div className="text-right text-3xl font-mono font-bold text-amber-400 tracking-wider truncate">
            {display}
          </div>
        </div>

        {/* Keypad Grid */}
        <div className="p-3 grid grid-cols-5 gap-1.5 text-xs font-medium">
          {/* Row 1: Constants & Functions */}
          <button onClick={() => handleUnary('sin')} className="btn-calc-fn">sin</button>
          <button onClick={() => handleUnary('cos')} className="btn-calc-fn">cos</button>
          <button onClick={() => handleUnary('tan')} className="btn-calc-fn">tan</button>
          <button onClick={() => handleUnary('sqrt')} className="btn-calc-fn">√x</button>
          <button onClick={handleClear} className="btn-calc-del">C</button>

          {/* Row 2: Inverses & Log */}
          <button onClick={() => handleUnary('asin')} className="btn-calc-fn">sin⁻¹</button>
          <button onClick={() => handleUnary('acos')} className="btn-calc-fn">cos⁻¹</button>
          <button onClick={() => handleUnary('atan')} className="btn-calc-fn">tan⁻¹</button>
          <button onClick={() => handleUnary('sqr')} className="btn-calc-fn">x²</button>
          <button onClick={handleBackspace} className="btn-calc-fn">⌫</button>

          {/* Row 3: Log & Powers */}
          <button onClick={() => handleUnary('ln')} className="btn-calc-fn">ln</button>
          <button onClick={() => handleUnary('log')} className="btn-calc-fn">log₁₀</button>
          <button onClick={() => handleUnary('exp')} className="btn-calc-fn">eˣ</button>
          <button onClick={() => handleUnary('inv')} className="btn-calc-fn">1/x</button>
          <button onClick={() => handleOp('/')} className="btn-calc-op">÷</button>

          {/* Row 4: 7 8 9 * */}
          <button onClick={() => setDisplay(String(Math.PI))} className="btn-calc-fn">π</button>
          <button onClick={() => handleNum('7')} className="btn-calc-num">7</button>
          <button onClick={() => handleNum('8')} className="btn-calc-num">8</button>
          <button onClick={() => handleNum('9')} className="btn-calc-num">9</button>
          <button onClick={() => handleOp('*')} className="btn-calc-op">×</button>

          {/* Row 5: 4 5 6 - */}
          <button onClick={() => setDisplay(String(Math.E))} className="btn-calc-fn">e</button>
          <button onClick={() => handleNum('4')} className="btn-calc-num">4</button>
          <button onClick={() => handleNum('5')} className="btn-calc-num">5</button>
          <button onClick={() => handleNum('6')} className="btn-calc-num">6</button>
          <button onClick={() => handleOp('-')} className="btn-calc-op">−</button>

          {/* Row 6: 1 2 3 + */}
          <button onClick={() => handleUnary('neg')} className="btn-calc-fn">±</button>
          <button onClick={() => handleNum('1')} className="btn-calc-num">1</button>
          <button onClick={() => handleNum('2')} className="btn-calc-num">2</button>
          <button onClick={() => handleNum('3')} className="btn-calc-num">3</button>
          <button onClick={() => handleOp('+')} className="btn-calc-op">+</button>

          {/* Row 7: 0 . = */}
          <button 
            onClick={() => { setMemory(parseFloat(display)); }} 
            className="btn-calc-fn"
          >
            MS
          </button>
          <button 
            onClick={() => { setDisplay(String(memory)); }} 
            className="btn-calc-fn"
          >
            MR
          </button>
          <button onClick={() => handleNum('0')} className="btn-calc-num">0</button>
          <button onClick={() => handleNum('.')} className="btn-calc-num">.</button>
          <button onClick={handleCalculate} className="btn-calc-eq">=</button>
        </div>
      </div>

      <style>{`
        .btn-calc-num {
          padding: 0.6rem;
          border-radius: 0.5rem;
          background: #1e293b;
          color: #f1f5f9;
          font-weight: 600;
          border: 1px solid #334155;
          transition: all 0.15s;
        }
        .btn-calc-num:hover {
          background: #334155;
        }
        .btn-calc-fn {
          padding: 0.6rem;
          border-radius: 0.5rem;
          background: #0f172a;
          color: #94a3b8;
          font-family: monospace;
          border: 1px solid #1e293b;
          transition: all 0.15s;
        }
        .btn-calc-fn:hover {
          background: #1e293b;
          color: #f8fafc;
        }
        .btn-calc-op {
          padding: 0.6rem;
          border-radius: 0.5rem;
          background: #0284c7;
          color: #ffffff;
          font-weight: 700;
          font-size: 1rem;
          transition: all 0.15s;
        }
        .btn-calc-op:hover {
          background: #0369a1;
        }
        .btn-calc-del {
          padding: 0.6rem;
          border-radius: 0.5rem;
          background: #dc2626;
          color: #ffffff;
          font-weight: 700;
          transition: all 0.15s;
        }
        .btn-calc-del:hover {
          background: #b91c1c;
        }
        .btn-calc-eq {
          padding: 0.6rem;
          border-radius: 0.5rem;
          background: #f59e0b;
          color: #0f172a;
          font-weight: 800;
          font-size: 1.1rem;
          transition: all 0.15s;
        }
        .btn-calc-eq:hover {
          background: #d97706;
        }
      `}</style>
    </div>
  );
};
