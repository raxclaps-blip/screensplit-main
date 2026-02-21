import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'Screensplit - Create Stunning Before & After Images'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #000000 0%, #1f2937 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              background: 'linear-gradient(135deg, #ffffff 0%, #9CA3AF 100%)',
              borderRadius: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 8,
                height: 60,
                background: '#000000',
                borderRadius: 4,
              }}
            />
          </div>
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #ffffff 0%, #e5e7eb 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          Screensplit
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#9CA3AF',
            textAlign: 'center',
            maxWidth: 900,
          }}
        >
          Create Stunning Before & After Images
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
