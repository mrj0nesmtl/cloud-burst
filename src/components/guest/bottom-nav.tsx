'use client'

import { useRouter } from 'next/navigation'
import { Home, Camera, Image as ImageIcon, Upload, User } from 'lucide-react'

interface BottomNavProps {
  activeTab: 'dashboard' | 'camera' | 'gallery' | 'upload' | 'profile'
  invitationToken: string | null
}

export function BottomNav({ activeTab, invitationToken }: BottomNavProps) {
  const router = useRouter()
  
  const navigateTo = (path: string) => {
    if (invitationToken) {
      router.push(`${path}?token=${invitationToken}`)
    } else {
      router.push(path)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '76px' }}>
      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          background: 'transparent',
          pointerEvents: 'none',
          padding: '0 16px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            width: '100%',
            maxWidth: '500px',
            height: '68px',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1)',
            pointerEvents: 'auto',
          }}
        >
          <NavButton 
            icon={<Home size={22} />} 
            label="Home" 
            isActive={activeTab === 'dashboard'} 
            onClick={() => navigateTo('/guest/dashboard')} 
          />
          <NavButton 
            icon={<Camera size={22} />} 
            label="Camera" 
            isActive={activeTab === 'camera'} 
            onClick={() => navigateTo('/guest/camera')} 
          />
          <NavButton 
            icon={<ImageIcon size={22} />} 
            label="Gallery" 
            isActive={activeTab === 'gallery'} 
            onClick={() => navigateTo('/guest/gallery')} 
          />
          <NavButton 
            icon={<Upload size={22} />} 
            label="Upload" 
            isActive={activeTab === 'upload'} 
            onClick={() => navigateTo('/guest/upload')} 
          />
          <NavButton 
            icon={<User size={22} />} 
            label="Profile" 
            isActive={activeTab === 'profile'} 
            onClick={() => navigateTo('/guest/profile')} 
          />
        </div>
      </div>
    </div>
  )
}

interface NavButtonProps {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}

function NavButton({ icon, label, isActive, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 8px',
        borderRadius: '0',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: isActive ? '#3b82f6' : 'rgba(156, 163, 175, 1)',
        transition: 'color 0.2s ease, transform 0.1s ease',
      }}
    >
      <div 
        style={{ 
          marginBottom: '4px',
          transform: isActive ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.2s ease'
        }}
      >
        {icon}
      </div>
      <span style={{ 
        fontSize: '0.75rem', 
        fontWeight: isActive ? '500' : '400',
        opacity: isActive ? '1' : '0.8'
      }}>
        {label}
      </span>
    </button>
  )
} 