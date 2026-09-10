import { useFileManager } from "../context/FileManagerContext";

const Breadcrumbs = () => {
    const {
        currentFolder,
        folderHistory,
        navigateToBreadcrumb
    } = useFileManager();

    const breadcrumbs = [
        {
            id: null,
            name: "Home"
        },

        ...folderHistory
            .filter((folder) => folder !== null)
            .map((folder) => ({
                id: folder._id,
                name: folder.name
            })),

        ...(currentFolder
            ? [
                  {
                      id: currentFolder._id,
                      name: currentFolder.name
                  }
              ]
            : [])
    ];

    return (
        <div className="breadcrumbs">
            {breadcrumbs.map((breadcrumb, index) => (
                <span
                    key={`${breadcrumb.id || "home"}-${index}`}
                    className="breadcrumb-item"
                >
                    <button
                        type="button"
                        onClick={() =>
                            navigateToBreadcrumb(
                                breadcrumb.id,
                                index
                            )
                        }
                    >
                        {breadcrumb.name}
                    </button>

                    {index < breadcrumbs.length - 1 && (
                        <span className="breadcrumb-separator">
                            /
                        </span>
                    )}
                </span>
            ))}
        </div>
    );
};

export default Breadcrumbs;