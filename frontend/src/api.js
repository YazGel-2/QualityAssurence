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

export const getMyNotesApi = async () => {
  return await apiCall('/note/my-notes', {
    method: 'GET',
  });
};

export const createNoteApi = async (noteData) => {
  return await apiCall('/note/create', {
    method: 'POST',
    body: JSON.stringify(noteData),
  });
};

export const updateNoteApi = async (noteId, noteData) => {
  return await apiCall(`/note/edit/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify(noteData),
  });
};

export const deleteNoteApi = async (noteId) => {
  return await apiCall(`/note/delete/${noteId}`, {
    method: 'DELETE',
  });
};

export const getAllUsersApi = async () => {
  return await apiCall('/user/getall', {
    method: 'GET',
  });
};

export const deleteUserApi = async (userId) => {
  return await apiCall(`/user/delete/${userId}`, {
    method: 'DELETE',
  });
};