export default function QtyStepper({ value, max, onChange, label = 'Quantity', size = 'md' }) {
  return (
    <div className={`qty qty--${size}`} role="group" aria-label={label}>
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(value - 1)} disabled={value <= 1}>−</button>
      <span aria-live="polite">{value}</span>
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(value + 1)} disabled={value >= max}>+</button>
    </div>
  );
}
