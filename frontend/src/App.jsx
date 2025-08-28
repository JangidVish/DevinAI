import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { UserProvider } from './context/user.context'
import "./App.css"
import "highlight.js/styles/github-dark.css"; 



const App = () => {
  return (
    <div className='flex flex-col h-screen w-screen justify-center items-center'>
      <UserProvider>
        {/* <Toaster /> */}
      <AppRoutes />
      </UserProvider>
    </div>
  )
}

export default App
