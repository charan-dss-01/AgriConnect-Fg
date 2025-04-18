// This function returns the API URL based on the NODE_ENV environment variable.
const getApiUrl = () => {
  // Check if the NODE_ENV environment variable is set and if it's set to 'production'.
  if (process.env.VITE_NODE_ENV === 'production') {
    // If in production, return the deployed backend URL from environment variable.
    // If the environment variable is not set, default to localhost.
    return process.env.VITE_BACKEND_URL || 'http://localhost:3000';
  } else {    
    // If not in production (or if NODE_ENV is not set), return the development URL.
    return 'http://localhost:3000';
  }
};
// Export the function as the default export of the module.
export default getApiUrl;