import { useState } from "react";

const CreateFolderModal = ({
    isOpen,
    onClose,
    onCreate,
    loading
}) => {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            setError("Folder name is required.");
            return;
        }

        try {
            setError("");

            await onCreate(name.trim());

            setName("");
            onClose();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to create folder."
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
                <h2>Create Folder</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="folder-name">
                            Folder name
                        </label>

                        <input
                            id="folder-name"
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="Enter folder name"
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
                            {loading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFolderModal;