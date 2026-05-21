import Link from "next/link"

interface LogoIconProps {
  size?: number
  className?: string
}

export function LogoIcon({ size = 32, className = "" }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle cx="32" cy="32" r="30" stroke="#2D5016" strokeWidth="2.5" strokeOpacity="0.35" fill="none" />
      {/* Middle ring */}
      <circle cx="32" cy="32" r="21" stroke="#2D5016" strokeWidth="2.5" strokeOpacity="0.6" fill="none" />
      {/* Solid green circle */}
      <circle cx="32" cy="32" r="13" fill="#2D5016" />
      {/* Copper center dot */}
      <circle cx="32" cy="32" r="5.5" fill="#8B4513" />
    </svg>
  )
}

interface LogoWordmarkProps {
  iconSize?: number
  className?: string
  href?: string
}

export function LogoWordmark({ iconSize = 32, className = "", href = "/" }: LogoWordmarkProps) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={iconSize} />
      <span
        style={{
          fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif)",
          fontSize: iconSize > 28 ? "1.125rem" : "0.9rem",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: "#2D5016",
          lineHeight: 1,
        }}
      >
        Respir<span style={{ color: "#8B4513" }}>facile</span>
      </span>
    </span>
  )

  if (href) {
    return (
      <Link href={href} className="flex-shrink-0">
        {content}
      </Link>
    )
  }
  return content
}
