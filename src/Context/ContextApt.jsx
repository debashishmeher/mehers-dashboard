import { createContext, useContext, useEffect, useState } from 'react';
const UserContext = createContext();
import Cookies from "js-cookie";

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const authToken = Cookies.get("authToken");


      if (!authToken) {
        setLoading(false);
        return;
      }

      try {

        const authResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/user/isAuthenticated`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            Authorization: `${authToken}`
          }
        });

        if (!authResponse.ok) {
          throw new Error(`Authentication check failed: ${authResponse.status}`);
        }

        const authData = await authResponse.json();
        setUserData(authData);

      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <UserContext.Provider value={{ userData, setUserData, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for easy usage
export const useUser = () => useContext(UserContext);