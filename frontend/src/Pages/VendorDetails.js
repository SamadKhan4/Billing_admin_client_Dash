import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Paper,
    Typography,
    Grid,
    Box,
    IconButton,
    Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VendorDetails = ({ token }) => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        vendorName: '',
        phone: '',
        email: '',
        address: '',
        products: [],
        category: '',
    });

    const [vendors, setVendors] = useState([]);
    const [product, setProduct] = useState({ name: '', quantity: '' });
    const [suggestions, setSuggestions] = useState([]);

    const categories = [
        "Grocery", "Furniture", "Clothing", "Electronics",
        "Stationery", "Hardware", "Medical", "Cosmetics"
    ];

    const fetchVendors = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/vendors', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setVendors(res.data);
        } catch (err) {
            console.error('❌ Error fetching vendors', err);
        }
    };

    const fetchSuggestions = async (input) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/vendors?name=${input}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuggestions(res.data);
        } catch (err) {
            console.error('❌ Error fetching suggestions', err);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleProductChange = (e) => {
        setProduct(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddProduct = () => {
        if (product.name.trim() && product.quantity.trim()) {
            setForm(prev => ({
                ...prev,
                products: [...prev.products, {
                    name: product.name.trim(),
                    quantity: Number(product.quantity)
                }]
            }));
            setProduct({ name: '', quantity: '' });
        } else {
            alert("⚠️ Enter valid product & quantity");
        }
    };

    const handleSubmit = async () => {
        if (!form.vendorName || !form.phone || !form.email || !form.address || form.products.length === 0 || !form.category) {
            alert("⚠️ Fill all fields and add at least one product & select a category.");
            return;
        }

        try {
            await axios.post("http://localhost:5000/api/vendors", form, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("✅ Vendor added!");
            setForm({
                vendorName: '',
                phone: '',
                email: '',
                address: '',
                products: [],
                category: '',
            });
            fetchVendors();
        } catch (err) {
            if (err.response?.status === 409) {
                alert("⚠️ Vendor already exists with the same details.");
            } else if (err.response?.status === 400) {
                alert("❌ Invalid input. Please check all fields.");
            } else {
                console.error("❌ Server error:", err);
                alert("❌ Failed to add vendor:\n" + (err?.response?.data?.msg || err.message));
            }
        }
    };

    const handleVendorClick = (vendorName) => {
        navigate("/vendor-details-view", { state: { vendorName } });
    };

    return (
        <Box className="w-full p-4 space-y-6 bg-white text-black mt-16 sm:mt-0">
            {/* Add Vendor Form */}
            <Paper elevation={3} className="p-5 rounded-xl shadow-md">
                <Typography className="font-bold mb-4" variant="h6">➕ Add Vendor</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Autocomplete
                            freeSolo
                            options={suggestions.map(v => v.vendorName)}
                            inputValue={form.vendorName}
                            onInputChange={(e, value) => {
                                setForm(prev => ({
                                    ...prev,
                                    vendorName: value,
                                    ...(value === '' && { phone: '', email: '', address: '' })
                                }));
                                if (value.length > 0) fetchSuggestions(value);
                            }}
                            onChange={(e, value) => {
                                const matched = suggestions.find(v => v.vendorName === value);
                                if (matched) {
                                    setForm(prev => ({
                                        ...prev,
                                        vendorName: matched.vendorName,
                                        phone: matched.phone,
                                        email: matched.email,
                                        address: matched.address || ''
                                    }));
                                }
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Vendor Name" fullWidth sx={{ width: '300px' }} />
                            )}
                        />
                    </Grid>

                    {['phone', 'email', 'address'].map((field) => (
                        <Grid item xs={12} key={field}>
                            <TextField
                                fullWidth
                                label={field.charAt(0).toUpperCase() + field.slice(1)}
                                name={field}
                                value={form[field]}
                                onChange={(e) => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                            />
                        </Grid>
                    ))}

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Product Name"
                            name="name"
                            value={product.name}
                            onChange={handleProductChange}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Quantity"
                            name="quantity"
                            type="number"
                            value={product.quantity}
                            onChange={handleProductChange}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Autocomplete
                            freeSolo
                            options={categories}
                            value={form.category}
                            onChange={(e, value) => {
                                setForm(prev => ({ ...prev, category: value }));
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Category" fullWidth sx={{ width: '200px' }} />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <IconButton color="primary" onClick={handleAddProduct}>
                            <AddIcon />
                        </IconButton>
                        <Box className="flex flex-wrap gap-2 mt-2">
                            {form.products.map((p, idx) => (
                                <span
                                    key={idx}
                                    className="bg-yellow-100 text-black px-3 py-1 rounded-full shadow"
                                >
                                    {p.name} - {p.quantity}
                                </span>
                            ))}
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            className="bg-black text-yellow-400 hover:bg-yellow-400 hover:text-black rounded-lg"
                        >
                            Submit
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Vendor Cards */}
            <Box>
                <Typography variant="h6" className="mb-2">Vendor List</Typography>
                {vendors.length === 0 ? (
                    <Typography>No vendors found.</Typography>
                ) : (
                    <Grid container spacing={2}>
                        {Array.from(new Set(vendors.map(v => v.vendorName))).map((vendorName, idx) => (
                            <Grid item xs={12} sm={6} md={4} key={idx}>
                                <Paper
                                    elevation={2}
                                    className="p-4 rounded-xl shadow cursor-pointer hover:bg-yellow-50"
                                    onClick={() => handleVendorClick(vendorName)}
                                >
                                    <Typography className="font-semibold text-lg">
                                        {vendorName}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Box>
    );
};

export default VendorDetails;
