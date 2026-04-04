const BASE_URL = 'http://localhost:3000';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API isteği sırasında bir hata oluştu.');
  }

  return response.json();
};

export const loginApi = async (credentials) => {
  return await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const registerApi = async (userData) => {
  return await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};