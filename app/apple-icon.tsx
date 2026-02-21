import { ImageResponse } from 'next/og'
 
export const size = {
  width: 180,
  height: 180,
}
 
export const contentType = 'image/png'
 
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #ffffff 0%, #9CA3AF 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 30,
        }}
      >
        <div
          style={{
            width: 8,
            height: 80,
            background: '#000000',
            borderRadius: 4,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
