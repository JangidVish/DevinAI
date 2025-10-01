import React, { useEffect, useState } from "react";
import api from "../config/axios";
import toast from "react-hot-toast";
import "../styles/components/AddUserPopUp.css";

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
    <div className="add-user-popup__overlay">
      <div className="add-user-popup__content">
        <h2 className="add-user-popup__title">Add Collaborators</h2>

        {loading ? (
          <div className="add-user-popup__loading">
            <div className="add-user-popup__spinner"></div>
          </div>
        ) : allUser && allUser.users?.length > 0 ? (
          <div className="add-user-popup__user-list">
            <ul className="add-user-popup__users">
              {allUser.users.map((user) => (
                <li key={user._id} className="add-user-popup__user-item">
                  <div className="add-user-popup__user-info">
                    <div className="add-user-popup__user-avatar">
                      <i className="ri-user-line"></i>
                    </div>
                    <span className="add-user-popup__user-email">
                      {user.email}
                    </span>
                  </div>
                  <button
                    className="add-user-popup__add-btn"
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
          <div className="add-user-popup__empty-state">
            <p className="add-user-popup__empty-text">
              No users available to add.
            </p>
          </div>
        )}

        <div className="add-user-popup__footer">
          <button className="add-user-popup__cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserPopUp;
