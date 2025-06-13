"use client";

import React from 'react'

const MobileNavbar = () => {
  return (
    <div className="flex lg:hidden w-full">
      <div className="text-lg font-bold">Logo</div>
      <nav className="space-x-4">
        <a href="#" className="">Home</a>
        <a href="#" className="">About</a>
        <a href="#" className="">Services</a>
        <a href="#" className="">Contact</a>
      </nav>
    </div>
  )
}

const DesktopNavbar = () => {
  return (
    <div className="hidden lg:flex w-full">
      <div className="text-lg font-bold">Logo</div>
      <nav className="space-x-4">
        <a href="#" className="">Home</a>
        <a href="#" className="">About</a>
        <a href="#" className="">Services</a>
        <a href="#" className="">Contact</a>
      </nav>
    </div>
  )
}

const Navbar = () => {
  return (
    <React.Fragment>
      <MobileNavbar />
      <DesktopNavbar />
    </React.Fragment>
  )
}

export { Navbar };
