import React from 'react'

/* Atlas Admin — Switch. Status toggle (enable/disable). */

const sizeMap = {
  sm: { w: 30, h: 17, knob: 13 },
  md: { w: 38, h: 21, knob: 17 },
}

export function Switch({ checked = false, disabled = false, onChange, size = 'md', style, ...props }) {
  const s = sizeMap[size] || sizeMap.md
  const track = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: s.w + 'px',
    height: s.h + 'px',
    flexShrink: 0,
    borderRadius: 'var(--radius-full)',
    background: checked ? 'var(--primary)' : 'var(--border-strong)',
    transition: 'background var(--dur-med) var(--ease-standard)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    padding: '2px',
    border: 'none',
    ...style,
  }
  const knob = {
    position: 'absolute',
    top: '2px',
    left: checked ? s.w - s.knob - 2 + 'px' : '2px',
    width: s.knob + 'px',
    height: s.knob + 'px',
    borderRadius: 'var(--radius-full)',
    background: '#fff',
    boxShadow: 'var(--shadow-sm)',
    transition: 'left var(--dur-med) var(--ease-out)',
  }
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange && onChange(!checked)}
      style={track}
      {...props}
    >
      <span style={knob} />
    </button>
  )
}
