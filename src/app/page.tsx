'use client'
import { useState, useEffect, useRef } from "react"
import { Timer } from '@/components'


export default function Home() {

  return (
    <div className="flex flex-col text-white p-4 min-h-screen bg-gray-900">
      <Timer />
    </div>
  )
}
