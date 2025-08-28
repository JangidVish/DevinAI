import React, { useEffect, useState } from 'react';
import api from '../config/axios';
import toast from 'react-hot-toast';


const AddUserPopUp = ({ projectId, onClose, onSuccess}) => {
  const [allUser, setAllUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [addUser, setAddUser]=useState([]);

  useEffect(() => {
    if (!projectId) {
      console.error("Project ID is missing");
      return;
    }

    const fetchAllUsers = async () => {
      try {
        const response = await api.get(`/user/all/${projectId}`);
        if (!response || !response.data) {
          toast.error("Error while fetching users");
          return;
        }
        setAllUser(response.data);
        // onSuccess(); 
        // console.log("Fetched users:", response.data);
      } catch (error) {
        toast.error("Error while fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [projectId]);

      const addUserId = async (addUser)=>{
      try {
        const response = await api.post("/project/addUser", {
          projectId,
          users: addUser
        }
      )

      if(!response){
        toast.error("Failed to add user: ")
      }

      toast.success("User Added Successfully");
      onSuccess()
      } catch (error) {
        toast.error("Error while adding user: ",error)  
      }

    } 

  return (
    <div className="fixed inset-0 bg-zinc-900 bg-opacity-60 flex items-center justify-center z-50">
      <div className="flex flex-col justify-around bg-gray-900/50 p-6 rounded shadow-lg min-h-[40vh] max-h-[80vh] overflow-y-auto min-w-[400px]">
        <h2 className="text-xl font-bold mb-4">All Users</h2>

        {loading ? (
          <p className="text-white">Loading...</p>
        ) : allUser && allUser.users?.length > 0 ? (
          <ul>
            {allUser.users.map((user) => (
              <li
                key={user._id}
                className="py-1 text-lg text-white flex justify-around items-center"
              >
                <p className="min-w-3/4">{user.email}</p>
                <div className="btn" onClick={()=>{
                  addUserId([user._id])
      
                }}>
                  <i className="ri-user-add-fill"></i>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-white">No users found.</p>
        )}

<button
  className="mt-4 px-4 py-2 rounded bg-gray-600 text-white"
  onClick={onClose}
>
  Cancel
</button>

      </div>
    </div>
  );
};

export default AddUserPopUp;
