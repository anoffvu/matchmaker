interface AvatarCircleProps {
  name: string
  size?: number
}

export function AvatarCircle({ name, size = 40 }: AvatarCircleProps) {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Generate a consistent hash for the name
  const getHashCode = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return hash
  }

  // Generate a random color in HSL space
  const generateColor = (
    hueOffset: number,
    saturation: number,
    lightness: number
  ) => {
    const hash = getHashCode(name + hueOffset)
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  // Generate gradient colors with more variance
  const getGradientColors = (name: string) => {
    const hash = getHashCode(name)

    // Base colors with high variety
    const baseColors = [
      ['#FF6B6B', '#4ECDC4'], // Coral to Turquoise
      ['#06D6A0', '#1B9AAA'], // Emerald to Ocean
      ['#7209B7', '#3A0CA3'], // Purple to Indigo
      ['#F72585', '#4361EE'], // Pink to Blue
      ['#4CC9F0', '#4895EF'], // Azure to Sky
      ['#F9C74F', '#90BE6D'], // Yellow to Green
      ['#2EC4B6', '#FF9F1C'], // Teal to Orange
      ['#9B5DE5', '#00BBF9'], // Purple to Cyan
      ['#FF006E', '#3A86FF'], // Red to Blue
      ['#8338EC', '#3A86FF'], // Purple to Blue
      ['#2D00F7', '#FF0075'], // Electric Blue to Hot Pink
      ['#00F5D4', '#00BBF9'], // Mint to Sky
    ]

    // Add some randomization to the colors while keeping them vibrant
    const color1 = generateColor(hash, 70 + (hash % 20), 60 + (hash % 15))
    const color2 = generateColor(
      hash + 180,
      70 + ((hash + 40) % 20),
      60 + ((hash + 40) % 15)
    )

    const angle = Math.abs(hash) % 360
    const spread = 140 + (Math.abs(hash) % 40)

    return {
      color1,
      color2,
      angle,
      spread,
    }
  }

  const { color1, color2, angle, spread } = getGradientColors(name)

  return (
    <div className='relative'>
      <div
        className='absolute inset-0 blur-md opacity-35'
        style={{
          width: size,
          height: size,
          background: `linear-gradient(${angle}deg, ${color1} 0%, ${color2} ${spread}%)`,
          transform: 'scale(1.15)',
        }}
      />
      <div
        className='rounded-full flex items-center justify-center text-white font-medium relative overflow-hidden'
        style={{
          width: size,
          height: size,
          fontSize: `${size * 0.4}px`,
          background: `linear-gradient(${angle}deg, ${color1} 0%, ${color2} ${spread}%)`,
          boxShadow: `
            inset 0 0 10px rgba(255,255,255,0.2),
            0 2px 8px -1px rgba(0,0,0,0.3)
          `,
        }}
      >
        <div
          className='relative z-10 font-semibold'
          style={{
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
        >
          {initials}
        </div>
        <div
          className='absolute inset-0 opacity-50'
          style={{
            background: `radial-gradient(circle at ${angle}% ${spread}%, transparent 0%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
      </div>
    </div>
  )
}
