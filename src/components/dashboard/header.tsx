import React from "react";
import Link from "next/link";

export function DashboardHeader() {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      borderBottom: '1px solid var(--border)',
      backgroundColor: 'var(--background)',
      width: '100%'
    }}>
      <div style={{
        display: 'flex',
        height: '64px',
        alignItems: 'center',
        padding: '0 24px'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Cloud Burst</span>
        </Link>
      </div>
    </header>
  );
} 