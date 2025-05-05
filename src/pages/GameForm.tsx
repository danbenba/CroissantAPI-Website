import React, { Dispatch, SetStateAction, useState } from 'react';
import '../styles/GameForm.css';

const GameForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        downloadLink: '',
        image: null as File | null,
    });

    const [errors, setErrors]: [any, Dispatch<SetStateAction<any>>] = useState({});
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, files } = e.target as any;
        setFormData({
            ...formData,
            [name]: files ? files[0] : value,
        });
    };

    const validate = () => {
        const newErrors: any = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.price) newErrors.price = 'Price is required';
        if (!formData.downloadLink) newErrors.downloadLink = 'Download link is required';
        if (!formData.image) newErrors.image = 'Image is required';
        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(null);
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        setLoading(true);

        // Prepare form data for multipart/form-data
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('download_link', formData.downloadLink);
        data.append('showInStore', '1');
        if (formData.image) data.append('image', formData.image);

        try {
            const res = await fetch('/api/games', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: data,
                credentials: 'include',
            });

            if (res.ok) {
                setSuccess('Game created successfully!');
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    downloadLink: '',
                    image: null,
                });
            } else {
                const err = await res.json();
                setErrors({ submit: err.message || 'Failed to create game.' });
            }
        } catch (err: any) {
            setErrors({ submit: err.message || 'Failed to create game.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="container"
            style={{
                padding: "32px",
                backgroundColor: "#3c3c3c",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                maxWidth: 500,
                margin: "40px auto"
            }}
        >
            <h1 style={{ textAlign: "center", marginBottom: 24 }}>
                <span style={{
                    background: "#3cbf7f",
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 20,
                    letterSpacing: 1
                }}>Submit a Game</span>
            </h1>
            <form onSubmit={handleSubmit} className="game-form">
                <div className="form-row">
                    <label htmlFor="name">
                        Name <span className="required">*</span>
                    </label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="dark-input"
                    />
                </div>
                {errors.name && <span className="error">{errors.name}</span>}
                <div className="form-row">
                    <label htmlFor="description">
                        Description <span className="required">*</span>
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="dark-input"
                        style={{ resize: "vertical" }}
                    />
                </div>
                {errors.description && <span className="error">{errors.description}</span>}
                <div className="form-row">
                    <label htmlFor="price">
                        Price <span className="required">*</span>
                    </label>
                    <input
                        id="price"
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min={0}
                        step="any"
                        className="dark-input"
                    />
                </div>
                {errors.price && <span className="error">{errors.price}</span>}
                <div className="form-row">
                    <label htmlFor="downloadLink">
                        Download Link <span className="required">*</span>
                    </label>
                    <input
                        id="downloadLink"
                        type="url"
                        name="downloadLink"
                        value={formData.downloadLink}
                        onChange={handleChange}
                        required
                        className="dark-input"
                    />
                </div>
                {errors.downloadLink && <span className="error">{errors.downloadLink}</span>}
                <div className="form-row">
                    <label htmlFor="image">
                        Image <span className="required">*</span>
                    </label>
                    <input
                        id="image"
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        required
                        className="dark-input"
                    />
                </div>
                {errors.image && <span className="error">{errors.image}</span>}
                {errors.submit && <span className="error">{errors.submit}</span>}
                {success && <span style={{ color: "#3cbf7f", fontWeight: 600 }}>{success}</span>}
                <button type="submit" style={{ marginTop: 10 }} disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </form>
        </div>
    );
};

export default GameForm;