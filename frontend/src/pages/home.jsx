import React, {  useEffect } from 'react';
import { UserContext } from '../context/user.context.jsx'; 
import { useNavigate } from "react-router-dom";

import api from '../config/axios.js';
import toast, { Toaster } from 'react-hot-toast';
import { useContext } from 'react';


const Home = () => {
      const [projectPopup, setProjectPopup] = React.useState(false);
      const [projectData, setProjectData] = React.useState(null);
      const [projectName, setProjectName] = React.useState('');
      const{user} = useContext(UserContext);
      console.log(user)

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!projectName) {
            toast.error("Project name is required");
            return;
        }
        try {
          const response =  await api.post("/project/create", {
            name:projectName
          })

          if(!response){
            toast.error("Error while creating project")
          }

          toast.success("Project created successfully")
          getAllProjects();
          
        } catch (error) {
          toast.error("Error while creating project: ",error)
        } finally{
          setProjectPopup(false);
        }
    }

   

    const getAllProjects = async ()=>{
      try {
        const response = await api.get("/project/all");
        setProjectData(response.data.project);

      } catch (error) {
        toast.error("Error while fetching projects: ", error )
      }
    }

    


    useEffect(() => {
      getAllProjects()
    }, [])

    const navigate = useNavigate();


  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-10 homeBg w-full z-10 overflow-hidden relative">
      <button className="absolute right-4 top-4"><i className="ri-logout-box-line text-4xl text-red-500"></i></button>
      <Toaster />
      <div className="circle absolute min-h-screen border-none w-1/2 rounded-full rotate-90 bottom-1/2  overflow-hidden  shadow-amber-700 shadow-2xl"></div>
      {projectPopup && (
        <div className="fixed bg-gradient from-black to-indigo-400 flex items-center justify-center z-50">
          <div className="  p-6 bg-black rounded shadow-lg flex flex-col items-center gap-4">      
            <h2 className="text-2xl font-bold mb-4">Create a New Project</h2>
            <form className="flex flex-col gap-4 ">
              <label className="text-lg flex flex-col items-center gap-2">
                Project Name:
                <input type="text" className="border p-2 rounded-lg mt-1 min-w-96"   value={projectName}
                onChange={(e) => setProjectName(e.target.value)} />
              </label>
              <button type="submit" className="bg-blue-500/90 text-white p-2 rounded" onClick={handleCreateProject}>
                Add a project
              </button>
              <button 
                type="button" 
                className="bg-red-500/80 text-white p-2 rounded mt-2"
                onClick={() => setProjectPopup(false)}
              >
                Cancel
              </button>
            </form>
            </div>
            </div>
            
            )}
    
      <h1 className=" font-bold text-center mt-7 text-6xl z-10 font-serif">
        Welcome To DevMetaAI<span className='text-[#f9e1e3]  uppercase'></span>
      </h1>
      <p className="text-center font-serif  text-2xl z-10 ">Enhance Your <span className='text-indigo-500 '>Project With DevMetaAI</span></p>
      <button className='bg-indigo-400 text-lg mt-8 rounded-lg cursor-pointer flex gap-2 z-10'  onClick={()=>{setProjectPopup(true)
      }}><i className="ri-link"></i>Create a project</button>
      {!projectData?
    (
      <h1>No Project Yet created</h1>
    ):(
      <div className="flex gap-4 mt-4 max-w-full flex-wrap z-10">
        {projectData.map((project, index)=>(
          <div
            className="to-gray-800/90 bg-gradient-to-tr
             from-indigo-400/50 to-bl w-70 h-30 rounded-xl p-4 flex flex-col justify-around cursor-pointer"
            key={index} 
              onClick={() => {
    navigate("/project", { state: { project } });  // 👈 Pass project as state
  }}
          
          >
            <h1 className='text-2xl font-bold'>{project.name}</h1>
            <div className="flex justify-between text-xl items-center ">
              <p className='mt-2'><i className="ri-user-fill"></i> {project.users.length}</p>
            </div>
          </div>
        ))}
      </div>
    )  
    }

    </div>
  )
}


export default Home
