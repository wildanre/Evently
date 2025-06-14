import React from 'react'
import Navbar from '../navbar'

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  )
}
