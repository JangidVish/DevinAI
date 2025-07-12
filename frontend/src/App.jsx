import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { UserProvider } from './context/user.context'

const App = () => {
  return (
    <div className='flex flex-col h-screen w-screen justify-center items-center gap-2  '>
      <UserProvider>
      <AppRoutes />
      </UserProvider>
    </div>
  )
}

export default App
