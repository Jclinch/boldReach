import React from 'react'

const AdminHeader = () => {
  return (
    <div>
         <header className="bg-white border-b border-[#E2E8F0] px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#1E293B]">Admin Panel</h1>
            <div className="text-sm text-[#94A3B8]">
              Welcome, Admin
            </div>
          </div>
        </header>
    </div>
  )
}

export default AdminHeader