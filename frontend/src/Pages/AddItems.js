import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Autocomplete,
  TextField,
  Alert,
  IconButton
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const AddItems = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const itemToUpdate = location.state?.itemToUpdate;

  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [alreadyAdded, setAlreadyAdded] = useState(false);
  const [existingItems, setExistingItems] = useState([]);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [item, setItem] = useState({
    name: "",
    costPrice: "",
    salePrice: "",
    stock: "",
    category: "",
    commission: ""
  });

  const isEditMode = !!itemToUpdate;

  useEffect(() => {
    const fetchAllVendors = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/vendors", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setVendors(res.data);
      } catch (err) {
        console.error("Vendor fetch error:", err);
      }
    };
    fetchAllVendors();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      setItem({
        name: itemToUpdate.name,
        costPrice: itemToUpdate.costPrice,
        salePrice: itemToUpdate.salePrice,
        stock: itemToUpdate.stock,
        category: itemToUpdate.category || "",
        commission: itemToUpdate.commission || ""
      });
      setSelectedVendor({ vendorName: itemToUpdate.vendorName || "" });
    }
  }, [itemToUpdate, isEditMode]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (selectedVendor) {
        try {
          const vendorName = encodeURIComponent(selectedVendor.vendorName);
          const res = await axios.get(
            `http://localhost:5000/api/vendors?name=${vendorName}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const mergedProducts = res.data.flatMap((v) =>
            (v.products || []).map((p) => ({
              ...p,
              stock: p.quantity || 0,
              category: p.category || v.category || "",
            }))
          );
          const productMap = new Map();
          for (const product of mergedProducts) {
            if (!productMap.has(product.name.toLowerCase())) {
              productMap.set(product.name.toLowerCase(), product);
            }
          }
          setProducts(Array.from(productMap.values()));
        } catch (err) {
          console.error("Product fetch error:", err);
        }
      } else {
        setProducts([]);
        setSelectedProduct(null);
      }
    };
    fetchProducts();
  }, [selectedVendor]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/items", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setExistingItems(res.data);
      } catch (err) {
        console.error("Item fetch error", err);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    const itemName = item.name?.trim().toLowerCase();
    const currentUser = localStorage.getItem("username");

    if (itemName && selectedVendor && currentUser) {
      const duplicate = existingItems.some(
        (i) =>
          i.name.trim().toLowerCase() === itemName &&
          i.createdBy === currentUser &&
          i.vendorName === selectedVendor.vendorName
      );
      setAlreadyAdded(!isEditMode && duplicate);
    } else {
      setAlreadyAdded(false);
    }
  }, [item.name, existingItems, selectedVendor, isEditMode]);

  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditMode && alreadyAdded) {
      alert(`🛑 This item "${item.name}" already exists for vendor "${selectedVendor?.vendorName}".`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const createdBy = localStorage.getItem("username");
      const createdByRole = localStorage.getItem("userType");

      const formData = new FormData();
      formData.append("name", item.name);
      formData.append("costPrice", item.costPrice);
      formData.append("salePrice", item.salePrice);
      formData.append("stock", item.stock);
      formData.append("category", item.category);
      formData.append("commission", item.commission);
      formData.append("vendorName", selectedVendor?.vendorName || "");
      formData.append("createdBy", createdBy);
      formData.append("createdByRole", createdByRole);
      if (image) formData.append("image", image);

      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/items/${itemToUpdate._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        const confirm = window.confirm("✅ Item updated successfully!\n\nGo to View Products?");
        if (confirm) navigate("/view-products");
      } else {
        await axios.post("http://localhost:5000/api/items/add", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        const confirm = window.confirm("✅ Item added successfully!\n\nGo to View Products?");
        if (confirm) navigate("/view-products");
      }

      setItem({ name: "", costPrice: "", salePrice: "", stock: "", category: "", commission: "" });
      setSelectedVendor(null);
      setSelectedProduct(null);
      setImage(null);
      setPreviewUrl(null);

    } catch (err) {
      const errorMsg = err?.response?.data?.error || err.message;
      alert("❌ Failed to save item!\n" + errorMsg);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-80 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-black mb-6">
          {isEditMode ? "✏️ Update Item" : "➕ Add New Item"}
        </h2>

        {alreadyAdded && !isEditMode && (
          <Alert severity="error" className="mb-4">
            🚫 This product already exists. Try adding a different product.
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="flex items-center space-x-2">
            <Autocomplete
              options={vendors}
              getOptionLabel={(option) => option.vendorName || ""}
              onChange={(e, val) => {
                setSelectedVendor(val);
                setSelectedProduct(null);
              }}
              value={selectedVendor}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={(params) => (
                <TextField {...params} label="Vendor Name" variant="outlined" required={!isEditMode} fullWidth />
              )}
              className="flex-grow"
            />
            <IconButton onClick={() => navigate("/vendors")} color="primary">
              <AddIcon />
            </IconButton>
          </div>

          <Autocomplete
            options={products}
            getOptionLabel={(option) =>
              option.name
                ? alreadyAdded && selectedProduct?.name === option.name
                  ? `${option.name} (Already Added)`
                  : option.name
                : ""
            }
            value={selectedProduct}
            onChange={(e, val) => {
              setSelectedProduct(val);
              setItem({
                ...item,
                name: val?.name || "",
                costPrice: val?.costPrice || "",
                salePrice: val?.salePrice || "",
                stock: val?.stock || "",
                category: val?.category || "",
                commission: val?.commission || "",
              });
            }}
            isOptionEqualToValue={(option, value) => option.name === value?.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Item Name"
                variant="outlined"
                required
                error={alreadyAdded && !isEditMode}
                helperText={
                  alreadyAdded && !isEditMode
                    ? `🛑 Item "${item.name}" already exists in View Products.`
                    : ""
                }
              />
            )}
          />

          <TextField label="Cost Price" name="costPrice" type="number" value={item.costPrice} onChange={handleChange} fullWidth required />
          <TextField label="Sale Price" name="salePrice" type="number" value={item.salePrice} onChange={handleChange} fullWidth required />
          <TextField label="Stock Quantity" name="stock" type="number" value={item.stock} onChange={handleChange} fullWidth required />
          <TextField label="Category" name="category" value={item.category} onChange={handleChange} fullWidth InputProps={{ readOnly: true }} required />
          <TextField
            label="Commission (%)"
            name="commission"
            type="number"
            value={item.commission}
            onChange={handleChange}
            fullWidth
            InputProps={{
              endAdornment: <span className="ml-2 text-gray-500">%</span>
            }}
            inputProps={{
              min: 0,
              max: 100,
              step: "0.01"
            }}
            helperText="Enter the commission percentage (e.g., 10%)"
          />

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">Upload Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-yellow-300 file:text-black hover:file:bg-yellow-400"
            />
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="mt-4 rounded-lg shadow-md w-full h-48 object-cover" />
            )}
          </div>

          <button
            type="submit"
            disabled={alreadyAdded && !isEditMode}
            className={`w-full py-3 rounded-xl font-semibold shadow-lg transition duration-300 ${alreadyAdded && !isEditMode
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-black text-yellow-300 hover:bg-yellow-400 hover:text-black"
              }`}
          >
            {isEditMode ? "Update Item" : "Add Item"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItems;
