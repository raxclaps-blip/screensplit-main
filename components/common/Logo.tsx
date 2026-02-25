import Image from "next/image"
import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
  size?: number
  priority?: boolean
}

const Logo = ({ className, size = 34, priority = false }: LogoProps) => {
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
      aria-label="Screensplit logo"
    >
      <Image
        src="/logo-light-mode.svg"
        alt="Screensplit"
        width={size}
        height={size}
        priority={priority}
        className="h-full w-full object-contain dark:hidden"
      />
      <Image
        src="/logo-dark-mode.svg"
        alt="Screensplit"
        width={size}
        height={size}
        priority={priority}
        className="hidden h-full w-full object-contain dark:block"
      />
    </span>
  )
}

export default Logo
