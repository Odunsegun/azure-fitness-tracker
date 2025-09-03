import React, { useState, useEffect } from "react";

export default function ProfileHeader() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@email.com");
  const [avatar, setAvatar] = useState("https://via.placeholder.com/100");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("profileInfo"));
    if (saved) {
      setName(saved.name || "John Doe");
      setEmail(saved.email || "john.doe@email.com");
      setAvatar(saved.avatar || "https://via.placeholder.com/100");
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(
      "profileInfo",
      JSON.stringify({ name, email, avatar })
    );
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-6 bg-white shadow rounded-xl p-6">
      <img
        src={avatar}
        alt="Profile Avatar"
        className="w-24 h-24 rounded-full border object-cover"
      />

      <div className="flex-1">
        {editing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="Full Name"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="Email"
            />
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="Avatar URL"
            />
            <button
              onClick={handleSave}
              className="mt-2 px-4 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-gray-500">{email}</p>
            <button
              onClick={() => setEditing(true)}
              className="mt-3 px-4 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}
