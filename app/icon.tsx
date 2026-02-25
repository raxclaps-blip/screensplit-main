import { ImageResponse } from 'next/og'
 
export const size = {
  width: 32,
  height: 32,
}
 
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: '#ffffff',
          borderRadius: '21.05%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '12.28%',
            top: '17.46%',
            width: '17.19%',
            height: '78.25%',
            borderRadius: '8.59%',
            transform: 'rotate(-22.5deg)',
            transformOrigin: 'top left',
            background: '#5EA500',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '42.46%',
            top: '17.46%',
            width: '17.19%',
            height: '78.25%',
            borderRadius: '8.59%',
            transform: 'rotate(-22.5deg)',
            transformOrigin: 'top left',
            background: '#5EA500',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '12.28%',
            top: '68.07%',
            width: '17.89%',
            height: '17.89%',
            borderRadius: '50%',
            background: '#09090B',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
