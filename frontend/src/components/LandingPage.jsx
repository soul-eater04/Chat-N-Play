import React from 'react'
import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div>
      <div className="h-screen flex items-center flex-col">
          <div className='text-3xl my-12 font-semibold'>Chat-N-Play</div>
          <div className="flex gap-4">
              <Link className="border p-3 rounded-md w-24 text-white text-center bg-blue-500 hover:bg-blue-600 transition-colors" to="/login">Login</Link>
              <Link className="border p-3 rounded-md w-24 text-white text-center bg-blue-500 hover:bg-blue-600 transition-colors" to="/signup">Signup</Link>
          </div>
      </div>
    </div>
  )
}

export default LandingPage
