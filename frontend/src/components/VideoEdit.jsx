import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast";
import { UPLOAD_VID, USER_UPDATE_VIDEO } from "../utils/API_CONFIG";
import { useSelector } from "react-redux";

const MAX_THUMB_SIZE = 3 * 1024 * 1024;
const MAX_THUMB_SIZE_MB = Math.round(MAX_THUMB_SIZE / 1000000);
const URL_REGEX = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/

function VideoEdit({ video, closeIt, handleAfterSave, isNewVideo }) {
    const [thumbPreview, setThumbPreview] = useState(null)
    const [thumbnail, setThumbnail] = useState(null)
    const [newTitle, setNewTitle] = useState("")
    const [newVideoURL, setNewVideoURL] = useState("")
    const [newDescription, setNewDescription] = useState("")
    const [newTags, setNewTags] = useState("")
    const [loading, setLoading] = useState(true)

    const _id = video?._id
    const description = video?.description
    const tags = video?.tags
    const thumbnailUrl = video?.thumbnailUrl
    const title = video?.title
    const channel = video?.channel

    const thumbnailInputRef = useRef(null)
    const token = useSelector(state => state.user.token)

    useEffect(() => {
        if (!video) return;
        setNewTitle(title || "");
        setNewDescription(description || "");
        setNewTags((tags || []).join(", "));
        setThumbPreview(null);
        setThumbnail(null);
        setLoading(false)
    }, [video]);

    useEffect(() => {
        if (isNewVideo) setLoading(false)
    }, [isNewVideo])

    function handleThumbChange(e) {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            if (thumbPreview) URL.revokeObjectURL(thumbPreview);
            setThumbPreview(URL.createObjectURL(file));
            setThumbnail(file)
        }
        e.target.value = ""
    }

    async function handleSubmit() {
        if (thumbnail) {
            const allowed_formats = ["jpg", "jpeg", "png", "webp"]
            const fileName = thumbnail.name.split(".")
            const fileType = fileName[fileName.length - 1].toLowerCase()
            if (!allowed_formats.includes(fileType)) {
                toast.error(`Sorry, but we don't allow ${fileType} filetypes`)
                toast.error("The allowed formats : jpg, jpeg, png, webp")
                return
            }
            if (thumbnail.size > MAX_THUMB_SIZE) {
                toast.error(`The maximum file size for thumbnail is ${MAX_THUMB_SIZE_MB} MB`)
                return
            }
        }
        if (isNewVideo) {
            if (!newTitle || !newVideoURL || !thumbnail) {
                toast.error("Title, Video URL and a Thumbnail is required to upload")
                return
            }
        } else {
            if (!newTitle && !newDescription && !newTags && !thumbnail) {
                toast.error("Please update at least one channel detail before saving changes")
                return
            }
        }

        const formData = new FormData();
        if (newTitle) {
            formData.append("title", newTitle)
        }
        if (newVideoURL) {
            if (!URL_REGEX.test(newVideoURL)) {
                toast.error("Please enter a valid video URL")
                return
            }
            formData.append("videoUrl", newVideoURL)
        }
        if (newDescription) {
            formData.append("description", newDescription)
        }
        if (newTags) {
            formData.append("tags", newTags)
        }
        if (thumbnail) {
            formData.append("thumbnail", thumbnail)
        }
        setLoading(true)
        try {
            let res
            if (isNewVideo) {
                res = await fetch(UPLOAD_VID, {
                    method: "POST",
                    headers: {
                        "authorization": `Bearer ${token}`
                    },
                    body: formData
                })
            } else {
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