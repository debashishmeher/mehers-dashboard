import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const MyProfile = () => {
  const [loading, setLoading] = useState(true);
  const { userId } = useParams();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    photo: null,
  });


  const [passwords, setPasswords] = useState({ password: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/user/${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
          setProfile({
            name: result.data.user.name || '',
            email: result.data.user.email || '',
            photo: result.data.user.photo || null,
          });
        } else {
          console.error('API error:', result.message || result);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({ ...profile, profileImage: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('name', profile.name);
    formData.append('email', profile.email);
    if (profile.profileImage) {
      formData.append('photo', profile.profileImage);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/user/${userId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setProfileMessage({ type: 'error', text: result.message || 'Failed to update profile.' });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setProfileMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    }
  };


  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (!passwords.password || passwords.password.trim().length < 6) {
      setPasswordMessage({
        type: 'error',
        text: 'Password must be at least 6 characters.',
      });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/user/${userId}/changepassword`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ password: passwords.password }),
        }
      );

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswords({ password: '' });
      } else {
        setPasswordMessage({
          type: 'error',
          text: result.message || 'Failed to update password.',
        });
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    }
  };


  if (loading) return <div className="text-center mt-20">Loading user data...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-10 space-y-10">
      {/* Profile Update */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-center">My Profile</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={previewImage || (profile.photo || '/default-avatar.png')}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:border file:rounded-lg file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          {profileMessage.text && (
            <div
              className={`text-sm px-4 py-2 rounded-md ${profileMessage.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
                }`}
            >
              {profileMessage.text}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          >
            Update Profile
          </button>
        </form>
      </section>

      {/* Change Password */}
      <section className="bg-gray-50 p-6 rounded-xl shadow-inner">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Change Password</h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">New Password</label>
            <input
              type="password"
              name="password"
              value={passwords.password}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Create a new password"
            />
          </div>

          {/* Conditional success/error message */}
          {passwordMessage.text && (
            <div
              className={`text-sm px-4 py-2 rounded-md ${passwordMessage.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
                }`}
            >
              {passwordMessage.text}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white py-2 px-4 rounded-lg font-semibold shadow-md transition"
          >
            Save New Password
          </button>
        </form>
      </section>


    </div>
  );
};

export default MyProfile;
