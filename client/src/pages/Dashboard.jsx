import React, { useEffect, useState } from 'react'
import { Gem, Sparkles } from 'lucide-react'
import CreationItem from '../components/CreationItem'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || (import.meta.env.PROD ? 'https://quickai-m9q6.onrender.com' : 'http://localhost:3000');

const Dashboard = () => {
  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()

  // ✅ Fetch user’s creations from backend
  const getDashboardData = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/user/get-user-creations', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })

      if (data.success) {
        setCreations(data.creation)
      } else {
        toast.error(data.message )
      }
    } catch (error) {
      
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getDashboardData()
  }, [])

  return (
    <div className='h-full overflow-y-scroll p-6'>
      {/* --- Summary Cards --- */}
      <div className='flex justify-start gap-4 flex-wrap'>
        {/* Total Creations */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Total Creations</p>
            <h2 className='text-xl font-semibold'> {creations.length} </h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center'>
            <Sparkles className='w-5 text-white' />
          </div>
        </div>

        {/* Active Plan */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-xl font-semibold'>Premium</h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center'>
            <Gem className='w-5 text-white' />
          </div>
        </div>
      </div>

      {/* --- Recent Creations --- */}
      <div className='space-y-3'>
        <p className='mt-6 mb-4 font-medium text-gray-700'>Recent Creations</p>

        {loading ? (
          <p className='text-gray-400 text-center'>Loading...</p>
        ) : creations.length === 0 ? (
          <p className='text-gray-400 text-center'>No creations yet.</p>
        ) : (
          creations.map((item) => <CreationItem key={item.id} item={item} />)
        )}
      </div>
    </div>
  )
}

export default Dashboard
