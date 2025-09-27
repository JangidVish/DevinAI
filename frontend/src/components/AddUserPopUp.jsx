import React, { useEffect, useState } from "react";
import api from "../config/axios";
import toast from "react-hot-toast";

const AddUserPopUp = ({ projectId, onClose, onSuccess }) => {
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

  const addUserId = async (addUser) => {
    try {
      const response = await api.post("/project/addUser", {
        projectId,
        users: addUser,
      });

      if (!response) {
        toast.error("Failed to add user: ");
      }

      toast.success("User Added Successfully");
      onSuccess();
    } catch (error) {
      toast.error("Error while adding user: ", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900 bg-opacity-60 flex items-center justify-center z-50">
      <div className="flex flex-col bg-gray-900/90 backdrop-blur-sm p-6 rounded-lg shadow-xl min-h-[40vh] max-h-[80vh] overflow-y-auto min-w-[450px] border border-indigo-400/30">
        <h2 className="text-xl font-bold mb-4 text-white">Add Collaborators</h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
          </div>
        ) : allUser && allUser.users?.length > 0 ? (
          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
              {allUser.users.map((user) => (
                <li
                  key={user._id}
                  className="py-3 px-4 text-lg text-white flex justify-between items-center bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                      <i className="ri-user-line text-white text-sm"></i>
                    </div>
                    <span className="text-gray-200">{user.email}</span>
                  </div>
                  <button
                    className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors flex items-center gap-2"
                    onClick={() => {
                      addUserId([user._id]);
                    }}
                  >
                    <i className="ri-user-add-fill"></i>
                    Add
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-400">No users available to add.</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-700">
          <button
            className="w-full px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserPopUp;
