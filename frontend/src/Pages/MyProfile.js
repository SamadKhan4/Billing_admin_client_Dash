import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/getCroppedImg";
import { Pencil, Trash2 } from "lucide-react";

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "" });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const navigate = useNavigate();

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    (async () => {
      try {
        const res = await fetch("http://localhost:5000/users/myprofile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Failed to fetch");
        setUser(data.user);
        setFormData({
          username: data.user.username,
          email: data.user.email,
          phone: data.user.phone || "",
        });
        setPreview(data.user.profilePicUrl);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [navigate]);

  const handleDelete = async () => {
    setDeleteError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/users/myprofile", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Deletion failed");
      localStorage.clear();
      alert("Account deleted successfully!");
      navigate("/");
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  const handleEditSubmit = async () => {
    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("username", formData.username);
    form.append("email", formData.email);
    form.append("phone", formData.phone);
    if (photo) form.append("photo", photo);

    try {
      const res = await fetch("http://localhost:5000/users/updateprofile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Update failed");
      setUser(data.user);
      setPreview(data.user.profilePicUrl);
      setEditMode(false);
      alert("Profile updated!");
    } catch (err) {
      setError(err.message);
    }
  };

  const readFile = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result));
      reader.readAsDataURL(file);
    });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgDataUrl = await readFile(file);
      setImageSrc(imgDataUrl);
      setShowCropper(true);
    }
  };

  const onCropComplete = (_, croppedArea) =>
    setCroppedAreaPixels(croppedArea);

  const uploadCroppedImage = async () => {
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
    const croppedFile = new File(
      [blob],
      `profile_${Date.now()}.jpg`,
      { type: "image/jpeg" }
    );
    setPhoto(croppedFile);
    setPreview(URL.createObjectURL(croppedFile));
    setShowCropper(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-yellow-50 shadow-md rounded-xl mt-10">
      <h2 className="text-3xl font-semibold mb-6 text-center">My Profile</h2>
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!user ? (
        <p className="text-center text-gray-600">Loading profile...</p>
      ) : (
        <div className="space-y-4 text-lg">
          {preview && (
            <div className="flex justify-center mb-4">
              <img
                src={`http://localhost:5000/${preview}`}
                alt="Profile"
                className="w-32 h-32 object-cover rounded-full border-4 border-yellow-300"
              />
            </div>
          )}

          {editMode ? (
            <>
              {user.userType === "Admin" && (
                <>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    disabled={user.userType !== "Admin"}
                    className={`w-full p-2 border rounded ${user.userType !== "Admin" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="Username"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={user.userType !== "Admin"}
                    className={`w-full p-2 border rounded ${user.userType !== "Admin" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="Email"
                  />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Phone Number"
                    className="w-full p-2 border rounded"
                  />
                </>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setEditMode(false)}
                  className="text-gray-600 hover:underline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            </>
          ) : (
            <>
              <p>
                <strong>👤 Username:</strong> {user.username}
              </p>
              <p>
                <strong>📧 Email:</strong> {user.email}
              </p>
              <p>
                <strong>📞 Phone:</strong> {user.phone || "Not Provided"}
              </p>
              <p>
                <strong>🔐 Role:</strong> {user.userType}
              </p>
              <p>
                <strong>🕒 Joined:</strong>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </>
          )}

          {/* Action Icons: Edit (Editor+Admin), Delete (Admin only) */}
          {user.userType === "Admin" && (
            <div className="flex justify-end items-center gap-6 mt-6">
              <button
                onClick={() => setEditMode(true)}
                title="Edit Profile"
                className="text-blue-600 hover:text-blue-800"
              >
                <Pencil size={24} />
              </button>

              <button
                onClick={() => setShowConfirm(true)}
                title="Delete Account"
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={24} />
              </button>
            </div>
          )}

          {user.userType === "Editor" && !editMode && (
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setEditMode(true)}
                className="text-sm px-3 py-1 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-500 transition"
              >
                Update Photo
              </button>
            </div>
          )}
        </div>
      )}

      {showConfirm && (
        <div className="mt-6 border-t pt-4">
          <p className="text-red-600 mb-2 font-semibold">
            Are you sure? Enter password to confirm deletion:
          </p>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full mb-2 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          {deleteError && (
            <p className="text-red-500 mb-2">{deleteError}</p>
          )}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowConfirm(false)}
              className="text-gray-600 hover:underline"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-5 rounded font-semibold"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}

      {showCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-xl w-[90%] max-w-md">
            <div className="relative w-full h-64">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setShowCropper(false)}
                className="text-gray-600 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={uploadCroppedImage}
                className="bg-green-600 text-white px-4 py-1.5 rounded"
              >
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
