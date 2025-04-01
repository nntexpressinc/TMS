import { createContext, useState, useContext } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component
export function AuthProvider({ children }) {
    // Add auth state with initial empty values
    const [isAuthenticated,setIsAuthenticated] = useState(false);

    // Optional: Add login function to update auth state
    const login = () => {
        setIsAuthenticated(true);
    };

    const value = {
        isAuthenticated,
        login,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the auth context easily
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};