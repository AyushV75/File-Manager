import { useRef } from "react";

const UploadFile = ({ currentFolder, uploadFile, loading }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        try {
            await uploadFile(file, currentFolder?._id);
        } catch (error) {
            // Error is already handled by FileManagerContext.
        }

        // Allow selecting the same file again later.
        event.target.value = "";
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={handleFileChange}
            />

            <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={loading}
            >
                {loading ? "Uploading..." : "↑ Upload File"}
            </button>
        </>
    );
};

export default UploadFile;