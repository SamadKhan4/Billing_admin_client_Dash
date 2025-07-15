// src/pages/VendorFullDetails.js

import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    IconButton,
    Autocomplete,
    TextField,
    Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const VendorFullDetails = () => {
    const { state } = useLocation();
    const vendorName = state?.vendorName;

    const [vendorEntries, setVendorEntries] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [filteredEntries, setFilteredEntries] = useState([]);

    const token = localStorage.getItem('token');

    const fetchVendorDetails = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/vendors?vendorName=${vendorName}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setVendorEntries(res.data || []);
            setFilteredEntries(res.data || []);
        } catch (err) {
            console.error("❌ Failed to fetch vendor details", err);
        }
    };

    useEffect(() => {
        if (vendorName) {
            fetchVendorDetails();
        }
    }, [vendorName]);

    useEffect(() => {
        if (!productSearch.trim()) {
            setFilteredEntries(vendorEntries);
        } else {
            const lower = productSearch.toLowerCase();
            const filtered = vendorEntries.filter(v =>
                v.products.some(p => p.name.toLowerCase().includes(lower))
            );
            setFilteredEntries(filtered);
        }
    }, [productSearch, vendorEntries]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this vendor entry?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/vendors/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert("✅ Vendor deleted.");
            fetchVendorDetails();
        } catch (err) {
            console.error("❌ Delete failed", err);
        }
    };

    if (!vendorName) {
        return <Typography>No vendor selected.</Typography>;
    }

    return (
        <Box className="p-4 bg-white text-black">
            <Typography variant="h5" gutterBottom>
                🧾 Vendor: <strong>{vendorName}</strong>
            </Typography>

            <Box className="my-4 max-w-md">
                <Autocomplete
                    freeSolo
                    options={[
                        ...new Set(
                            vendorEntries.flatMap(v => v.products.map(p => p.name))
                        ),
                    ]}
                    inputValue={productSearch}
                    onInputChange={(e, value) => setProductSearch(value)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search Product"
                            placeholder="Enter product name..."
                            fullWidth
                        />
                    )}
                />
            </Box>

            {filteredEntries.length === 0 ? (
                <Typography>No matching records found.</Typography>
            ) : (
                filteredEntries.map((entry, index) => (
                    <Paper key={entry._id} className="p-4 mb-4 rounded-xl border border-gray-300 bg-gray-100 shadow-sm">
                        <Typography className="mb-2 font-semibold text-base text-yellow-800">Entry #{index + 1}</Typography>
                        <Grid container direction="column" spacing={1}>
                            <Grid item><Typography><strong>Phone:</strong> {entry.phone}</Typography></Grid>
                            <Grid item><Typography><strong>Email:</strong> {entry.email}</Typography></Grid>
                            <Grid item><Typography><strong>Address:</strong> {entry.address}</Typography></Grid>
                            <Grid item><Typography><strong>Category:</strong> {entry.category || "—"}</Typography></Grid>
                            <Grid item>
                                <Typography><strong>Products:</strong></Typography>
                                <ul className="list-disc pl-5">
                                    {entry.products.map((prod, idx) => (
                                        <li key={idx}>{prod.name} - {prod.quantity}</li>
                                    ))}
                                </ul>
                            </Grid>
                            <Grid item>
                                <Typography className="mt-2"><strong>Created:</strong> {new Date(entry.createdAt).toLocaleString()}</Typography>
                            </Grid>
                            <Grid item className="flex justify-end">
                                <IconButton color="error" onClick={() => handleDelete(entry._id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Paper>
                ))
            )}
        </Box>
    );
};

export default VendorFullDetails;
