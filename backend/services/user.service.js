import userModel from "../model/user.model.js";

export const createUser = async ({ email, password, username }) => {
  if (!email || !password || !username) {
    throw new Error("Email, Password and Username is required");
  }

  const user = await userModel.create({
    email: email,
    password: password,
    username: username,
  });

  user.save();
  return user;
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email And Password is required");
  }

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.isValidPassword(password);

  if (!isMatch) {
    throw new Error("Invalid password");
  }

  return user;
};
