import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast";
import { ALL_VIDEOS, UPLOAD_VID, USER_UPDATE_VIDEO } from "../utils/API_CONFIG";
import { useSelector } from "react-redux";

const MAX_THUMB_SIZE = 3 * 1024 * 1024;
const MAX_THUMB_SIZE_MB = Math.round(MAX_THUMB_SIZE / 1000000);
const URL_REGEX = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/

// video edit modal for video edit and upload based on isNewVideo prop
function VideoEdit({ video, closeIt, handleAfterSave, isNewVideo }) {
    // declaring necessary states
    const [thumbPreview, setThumbPreview] = useState(null)
    const [thumbnail, setThumbnail] = useState(null)
    const [newTitle, setNewTitle] = useState("")
    const [newVideoURL, setNewVideoURL] = useState("")
    const [newDescription, setNewDescription] = useState("")
    const [newTags, setNewTags] = useState("")
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState("");
    const [customCategory, setCustomCategory] = useState("");
    const [videos, setVideos] = useState(null)

    // getting necessary details
    const _id = video?._id
    const description = video?.description
    const tags = video?.tags
    const thumbnailUrl = video?.thumbnailUrl
    const title = video?.title
    const channel = video?.channel

    // setting a reference point of thumbnail using useRef and getting token
    const thumbnailInputRef = useRef(null)
    const token = useSelector(state => state.user.token)

    // fetching videos to add categories for the select
    useEffect(() => {
        async function fetchVideos() {
            try {
                const res = await fetch(ALL_VIDEOS)
                const data = await res.json()
                if (res.status === 200) {
                    setVideos(data.videos)
                } else {
                    navigate("/404", {
                        replace: true,
                        state: {
                            from: `/`,
                            status: res.status,
                            messaage: "Unable to fetch feed videos"
                        }
                    })
                }
            } catch (error) {
                toast.error("Unable to fetch videos")
                console.error("Unable to fetch videos", error)
            }
        }
        fetchVideos()
    }, [])

    // adding existing video details if they exist
    useEffect(() => {
        if (!video) return;
        setNewTitle(title || "");
        setNewDescription(description || "");
        setNewTags((tags || []).join(", "));
        setSelectedCategory(video?.category || "");
        setThumbPreview(null);
        setThumbnail(null);
        setLoading(false)
    }, [video]);

    // if isNewVideo is true, should not load
    useEffect(() => {
        if (isNewVideo) setLoading(false)
    }, [isNewVideo])

    // handling thumbnail change to show the selected thumbnail on the UI as soon as it is selected, then setting e.target.value as "" to make it to default for next iteration
    function handleThumbChange(e) {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            if (thumbPreview) URL.revokeObjectURL(thumbPreview);
            setThumbPreview(URL.createObjectURL(file));
            setThumbnail(file)
        }
        e.target.value = ""
    }

    // handling submission of the details 
    async function handleSubmit() {
        if (thumbnail) {
            const allowed_formats = ["jpg", "jpeg", "png", "webp"]
            const fileName = thumbnail.name.split(".")
            const fileType = fileName[fileName.length - 1].toLowerCase()
            // if thumbnail exist, check if the file type does not include allowed formats
            if (!allowed_formats.includes(fileType)) {
                toast.error(`Sorry, but we don't allow ${fileType} filetypes`)
                toast.error("The allowed formats : jpg, jpeg, png, webp")
                return
            }
            // check if thumbnail size is more than MAX_THUMB_SIZE
            if (thumbnail.size > MAX_THUMB_SIZE) {
                toast.error(`The maximum file size for thumbnail is ${MAX_THUMB_SIZE_MB} MB`)
                return
            }
        }
        // if it is new video, checking all of them exist or if it is editing video, checking for any one of them exist
        if (isNewVideo) {
            if (!newTitle || !newVideoURL || !thumbnail) {
                toast.error("Title, Video URL and a Thumbnail is required to upload")
                return
            }
        } else {
            if (!newTitle && !newDescription && !newTags && !thumbnail && !selectedCategory) {
                toast.error("Please update at least one channel detail before saving changes")
                return
            }
        }

        // making formData to includes data, for sending to BE
        const formData = new FormData();

        // if title exists add to formData
        if (newTitle) {
            formData.append("title", newTitle)
        }

        // if URL exists, check if valid URL, then add to formData
        if (newVideoURL) {
            if (!URL_REGEX.test(newVideoURL)) {
                toast.error("Please enter a valid video URL")
                return
            }
            formData.append("videoUrl", newVideoURL)
        }
        // if description exists add to formData
        if (newDescription) {
            formData.append("description", newDescription)
        }
        // if tags exists add to formData
        if (newTags) {
            formData.append("tags", newTags)
        }
        // if thumbnail exists add to formData
        if (thumbnail) {
            formData.append("thumbnail", thumbnail)
        }
        /**
         * if category selected, 
         * check if it is other, 
         * if other, but empty, send toast, 
         * else format the custom cat add to formData
         * else, if no custom cat, add selected category to formData
         */
        if (selectedCategory) {
            if (selectedCategory === "Other") {
                if (isNewVideo && !customCategory.trim()) {
                    toast.error("Please enter a custom category");
                    return;
                }
                if (customCategory.trim()) {
                    const formatted = customCategory.trim().charAt(0).toUpperCase() + customCategory.trim().slice(1).toLowerCase();
                    formData.append("category", formatted);
                }
            } else {
                formData.append("category", selectedCategory);
            }
        }
        // set loading as true after checks, such that, it doesn't go to loading state and close itself before checks
        setLoading(true)
        try {
            let res
            // if new video, call relevant endpoint
            if (isNewVideo) {
                res = await fetch(UPLOAD_VID, {
                    method: "POST",
                    headers: {
                        "authorization": `Bearer ${token}`
                    },
                    body: formData
                })
            } else {
                // if edit video, call relevant endpoint
                res = await fetch(`${USER_UPDATE_VIDEO}/${channel}/${_id}`, {
                    method: "PUT",
                    headers: {
                        "authorization": `Bearer ${token}`
                    },
                    body: formData
                })
            }
            const data = await res.json()
            handleAfterSave(data.channel)
            toast.success(data.message)
        } catch (error) {
            console.error("Error while editing video", error)
            toast.error("Error while editing video")
        } finally {
            setLoading(false)
            closeIt()
        }
    }

    // close modal on esc keydown
    useEffect(() => {
        const close = (e) => {
            if (e.keyCode === 27) {
                closeIt()
            }
        }
        window.addEventListener('keydown', close)
        return () => window.removeEventListener('keydown', close)
    }, [])

    // set of unique categories by not including uncategorized amongst them
    const categories = [...new Set(videos?.map(vid => vid.category).filter(cat => cat && cat.trim().toLowerCase() !== "uncategorized")), "Other"]

    return (
        <div className="video-edit-overlay">
            <div className="video-edit-modal">
                {loading ?
                    <div className="loading-container">
                        <div className="loading-msg"></div>
                    </div> :
                    <>
                        <div className="video-edit-modal-header">
                            <h2>{isNewVideo ? "Upload" : "Update"} Video</h2>
                            <button onClick={() => closeIt()} className="video-modal-close">
                                <img src="https://img.icons8.com/?size=100&id=3062&format=png&color=FFFFFF" alt="close" />
                            </button>
                        </div>
                        <div className="video-edit-modal-content">
                            <div className="edit-group">
                                <label>Title {isNewVideo ? "(required)" : ""}</label>
                                <textarea type="text" placeholder="Add a title that describes your video" value={newTitle} required={isNewVideo} onChange={(e) => setNewTitle(e.target.value)} />
                            </div>
                            {isNewVideo && <div className="edit-group">
                                <label>Video URL {isNewVideo ? "(required)" : ""}</label>
                                <input type="text" placeholder="Add a video URL" value={newVideoURL} required={isNewVideo} onChange={(e) => setNewVideoURL(e.target.value)} />
                            </div>}
                            <div className="edit-group">
                                <label>Description</label>
                                <textarea type="text" placeholder="Tell viewers about your video" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                            </div>
                            <div className="edit-group">
                                <label>Tags</label>
                                <input type="text" placeholder="Add tags" value={newTags} onChange={(e) => setNewTags(e.target.value)} />
                                <small>Enter a comma after each tag</small>
                            </div>
                            <div className="edit-group category">
                                <label>Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="">-- Select a category --</option>
                                    {categories.map((cat, index) => <option key={index}>{cat}</option>)}
                                </select>

                                {selectedCategory === "Other" && (
                                    <input
                                        type="text"
                                        placeholder="Enter custom category"
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                    />
                                )}
                            </div>
                            <div className="thumbnail-edit-group">
                                <p>Thumbnail {isNewVideo ? "(required)" : ""}</p>
                                <small>Set a thumbnail that stands out and draws viewers' attention.</small>
                                <div className="thumbnail-preview">
                                    <img src={thumbPreview || (isNewVideo ? "https://dummyimage.com/1280x720/028282/000000.png" : thumbnailUrl)} alt="thumbnail-prev" />
                                    <button onClick={() => thumbnailInputRef.current.click()}>Upload Thumbnail</button>
                                    <input
                                        type="file"
                                        accept="image/jpg, image/jpeg, image/png, image/webp"
                                        onChange={handleThumbChange}
                                        ref={thumbnailInputRef}
                                        style={{ display: "none" }}
                                        required={isNewVideo}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="video-edit-modal-footer">
                            <button onClick={closeIt}>Cancel</button>
                            <button type="submit" onClick={handleSubmit}>Save</button>
                        </div>
                    </>
                }
            </div>
        </div>
    )
}

export default VideoEdit