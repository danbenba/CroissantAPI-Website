import React, { Dispatch, SetStateAction, useState } from "react";
import useAuth from "../../hooks/useAuth";
import Link from "next/link";
import useIsMobile from "../../hooks/useIsMobile";

const endpoint = "/api"; // Replace with your actual API endpoint

const CreateItem = () => {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    showInStore: false,
  });
  const [iconFile, setIconFile] = useState<File | null>(null);

  const [errors, setErrors]: [any, Dispatch<SetStateAction<any>>] = useState(
    {}
  );
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { token } = useAuth(); // Assuming useAuth is imported from your hooks

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIconFile(e.target.files[0]);
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.price) newErrors.price = "Price is required";
    // iconFile is now optional
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

    let iconHash = null;
    if (iconFile) {
      const iconData = new FormData();
      iconData.append("icon", iconFile);
      try {
        const res = await fetch("/upload/item-icon", {
          method: "POST",
          body: iconData,
        });
        if (res.ok) {
          const data = await res.json();
          iconHash = data.hash;
        } else {
          const err = await res.json();
          setErrors({ submit: err.error || "Failed to upload icon." });
          setLoading(false);
          return;
        }
      } catch (err: any) {
        setErrors({ submit: err.message || "Failed to upload icon." });
        setLoading(false);
        return;
      }
    }

    const data = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      showInStore: formData.showInStore,
      ...(iconHash && { iconHash }),
    };

    try {
      const res = await fetch(endpoint + "/items/create", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess("Item created successfully!");
        setFormData({
          name: "",
          description: "",
          price: "",
          showInStore: false,
        });
        setIconFile(null);
      } else {
        const err = await res.json();
        setErrors({ submit: err.message || "Failed to create item." });
      }
    } catch (err: any) {
      setErrors({ submit: err.message || "Failed to create item." });
    } finally {
      setLoading(false);
    }
  };

  if (isMobile) {
    return (
      <div
        style={{
          maxWidth: 340,
          margin: "40px auto",
          padding: "24px 12px",
          background: "#23272e",
          borderRadius: 12,
          color: "#fff",
          textAlign: "center",
          fontSize: "1.08em",
        }}
      >
        <h2 style={{ marginBottom: 10 }}>Not available on mobile</h2>
        <p>
          This page is only accessible from a computer.
          <br />
          Please use a PC to submit an item.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="createitem-container">
        <div style={{ marginBottom: 18 }}>
          <Link
            href="/dev-zone/my-items"
            style={{
              background: "#222",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              padding: "8px 16px",
              fontSize: "0.95rem",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            &larr; Back to My Items
          </Link>
        </div>
        <h1 className="createitem-title">
          <span>Submit an Item</span>
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
            />
          </div>
          {errors.description && (
            <span className="error">{errors.description}</span>
          )}
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
            <label htmlFor="showInStore" className="createitem-checkbox-label">
              <input
                id="showInStore"
                type="checkbox"
                name="showInStore"
                checked={formData.showInStore}
                onChange={handleChange}
                className="createitem-checkbox"
              />
              Show in Store
            </label>
          </div>
          <div className="form-row">
            <label htmlFor="icon">Icon (optional)</label>
            <label
              htmlFor="icon"
              className="custom-file-label createitem-file-label"
            >
              {iconFile ? "Change Icon" : "Choose Icon"}
              <input
                id="icon"
                type="file"
                accept="image/*"
                name="icon"
                onChange={handleIconChange}
                className="dark-input"
                style={{ display: "none" }}
              />
            </label>
            {iconFile && (
              <span className="createitem-ready">
                Selected: {iconFile.name}
              </span>
            )}
          </div>
          {errors.submit && <span className="error">{errors.submit}</span>}
          {success && <span className="createitem-success">{success}</span>}
          <button
            type="submit"
            className="createitem-submit-btn"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateItem;
