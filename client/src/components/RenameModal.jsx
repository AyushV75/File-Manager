import { useEffect, useState } from "react";

const RenameModal = ({
    isOpen,
    onClose,
    onRename,
    currentName,
    loading = false
}) => {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setName(currentName || "");
            setError("");
        }
    }, [isOpen, currentName]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            setError("Name is required.");
            return;
        }

        if (name.trim() === currentName) {
            setError("Please enter a different name.");
            return;
        }

        try {
            setError("");

            await onRename(name.trim());

            onClose();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to rename."
            );
        }
    };

    const handleClose = () => {
        setName("");
        setError("");
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Rename</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="rename-name">
                            New name
                        </label>

                        <input
                            id="rename-name"
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Renaming..." : "Rename"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RenameModal;