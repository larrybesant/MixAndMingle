import Link from "next/link"

export default function Button({ children, variant = "primary", href, className = "", ...props }) {
  const baseClasses = {
    primary: "btn-primary neon-glow-blue",
    secondary: "btn-secondary neon-border-purple",
    outline: "btn-outline",
  }

  const classes = `${baseClasses[variant]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
