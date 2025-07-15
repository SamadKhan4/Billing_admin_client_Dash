import React from "react";
import { useNavigate } from "react-router-dom";

const UserTypeDropdown = ({ current }) => {
  const navigate = useNavigate();

  const handleUserTypeChange = (e) => {
    const selected = e.target.value;
    switch (selected) {
      case "Editors":
        navigate("/total-editors");
        break;
      case "Customers":
        navigate("/all-customers");
        break;
      case "Agents":
        navigate("/all-agents");
        break;
      case "Vendors":
        navigate("/all-vendors");
        break;
      default:
        break;
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor="userType" className="font-medium mr-2">
        Select User Type:
      </label>
      <select
        id="userType"
        value={current}
        onChange={handleUserTypeChange}
        className="border border-gray-300 rounded px-3 py-1"
      >
        <option value="Editors">Editors</option>
        <option value="Customers">Customers</option>
        <option value="Agents">Agents</option>
        <option value="Vendors">Vendors</option>
      </select>
    </div>
  );
};

export default UserTypeDropdown;
