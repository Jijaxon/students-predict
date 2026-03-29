export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
}) {
  const variants = {
    primary:   'bg-[var(--accent-1)] text-white hover:opacity-90',
    secondary: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-card-hover)]',
    ghost:     'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]',
    success:   'bg-[var(--accent-4)] text-white hover:opacity-90',
    outline:   'border border-[var(--accent-2)] text-[var(--accent-2)] hover:bg-[var(--accent-2)] hover:text-white',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-2 rounded-lg font-medium
        transition-all duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        font-[var(--font-sans)]
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
