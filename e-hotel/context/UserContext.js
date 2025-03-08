"use client";
import { createContext, useState, useContext } from "react";
import Cookies from "js-cookie";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = Cookies.get("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData, token) => {
    setUser(userData);
    Cookies.set("user", JSON.stringify(userData), { expires: 1 });
    Cookies.set("token", token, { expires: 1 });
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("token");
    Cookies.remove("user");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
