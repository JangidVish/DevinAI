import React, { useContext, useEffect } from 'react';
import { UserContext } from '../context/user.context.jsx'; 
import { useNavigate } from "react-router-dom";

import api from '../config/axios.js';


const Home = () => {
      const [projectPopup, setProjectPopup] = React.useState(false);
      const [projectData, setProjectData] = React.useState(null);
      const [projectName, setProjectName] = React.useState('');

    const {_user}=useContext(UserContext);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!projectName) {
            alert("Project name is required");
            return;
        }
        try {
          const response =  await api.post("/project/create", {
            name:projectName
          })

          if(!response){
            console.log("Error while creating project")
          }

          console.log("Project created successfully")
          
        } catch (error) {
          console.log("Error while creating project: ",error)
        } finally{
          setProjectPopup(false);
        }
    }

   

    const getAllProjects = async ()=>{
      try {
        const response = await api.get("/project/all");
        setProjectData(response.data.project);

      } catch (error) {
        console.log("Error while fetching projects: ", error )
      }
    }




    useEffect(() => {
      getAllProjects()
    }, [])

    const navigate = useNavigate();


  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 homeBg w-full z-10 relative overflow-hidden">
      <div className="circle absolute min-h-screen border-8 w-1/2 rounded-full rotate-90 bottom-1/2 border-indigo-900 animate-ping"></div>
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
    
      <h1 className=" font-bold text-center mt-10 text-5xl z-10 font-serif">
        Welcome To <span className='text-indigo-400'>DevinAI</span>
      </h1>
      <p className="text-center  text-xl z-10">Enhance Your <span className='text-indigo-500'>Project With Devin</span></p>
      <button className='bg-indigo-400 text-lg mt-8 rounded-lg cursor-pointer flex gap-2 z-10'  onClick={()=>{setProjectPopup(true)
        console.log("Create Project Is Clicked")
      }}><i class="ri-link"></i>Create a project</button>
      {!projectData?
    (
      <h1>No Project Yet created</h1>
    ):(
      <div className="flex gap-4 mt-4 max-w-full flex-wrap z-10">
        {projectData.map((project)=>(
          <div
            className="to-gray-800/90 bg-gradient-to-tr
             from-indigo-400/50 to-bl w-70 h-30 rounded-xl p-4 flex flex-col justify-around cursor-pointer"
            key={project.id} 
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
