import { createContext, useContext, useCallback, useRef, useEffect, useState } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const toast = useCallback((message, type = 'info') => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div id="nova-toasts">
        {toasts.map(t => (
          <ToastItem key={t.id} message={t.message} type={t.type} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ message, type }) {
  const colors = { success: 'var(--gold)', error: '#FF453A', warning: '#FF9F0A', info: 'var(--t2)' };
  const icons = { success: '✦', error: '✕', warning: '⚠', info: '◆' };
  return (
    <div className="nova-toast">
      <span style={{ color: colors[type] || colors.info, fontSize: '15px', flexShrink: 0 }}>{icons[type] || icons.info}</span>
      <span>{message}</span>
    </div>
  );
}

export default function Toast() {
  // This is a no-op placeholder; the actual toasts render via ToastProvider
  return null;
}
