import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { useSelector } from "react-redux"
import { COMMENT, PLAY_VIDEO } from "../utils/API_CONFIG"
import { useConfirm } from "material-ui-confirm"
import toast from "react-hot-toast"

function Comment({ comment, videoId, setVideo }) {
    const [showCommenOption, setShowCommentOption] = useState(false)
    const [editingComment, setEditingComment] = useState(false)
    const [editedComment, setEditedComment] = useState("")
    const [showCommentBtn, setShowCommentBtn] = useState(false)
    const { avatar, username } = comment.user
    const user = useSelector(state => state.user.user)
    const token = useSelector(state => state.user.token)
    const confirm = useConfirm()

    async function handleEditComment() {
        if (editedComment.trim() == "") {
            toast("Cannot add empty comment")
            return
        }
        if (editedComment === comment.comment) {
            setShowCommentBtn(false)
            setEditingComment(false)
            return
        }
        try {
            const res = await fetch(`${COMMENT}/${videoId}/${comment?._id}`, {
                method: 'PUT',
                headers: {
                    "Content-type": "application/json",
                    "authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ updatedComment: editedComment })
            })
            const data = await res.json()
            if (res.status === 200) {
                const updatedVideoRes = await fetch(`${PLAY_VIDEO}/${videoId}`);
                const updatedData = await updatedVideoRes.json();
                setVideo(updatedData.video);
                toast.success(data.message)
                setShowCommentBtn(false)
                setEditingComment(false)
            } else {
                toast(data.message)
            }
        } catch (error) {
            console.error("Error while editing comment", error)
            toast.error("Error while editing comment")
        }
    }

    async function handleDeleteComment() {
        setShowCommentOption(false)
        try {
            const { confirmed } = await confirm({
                title: "Delete Comment?",
                description: "Delete your comment permanently?",
                confirmationText: "Delete",
                cancellationText: "Cancel"
            })
            if (confirmed) {
                const res = await fetch(`${COMMENT}/${videoId}/${comment?._id}`, {
                    method: 'DELETE',
                    headers: {
                        "Content-type": "application/json",
                        "authorization": `Bearer ${token}`
                    }
                })
                const data = await res.json()
                if (res.status === 200) {
                    const updatedVideoRes = await fetch(`${PLAY_VIDEO}/${videoId}`);
                    const updatedData = await updatedVideoRes.json();
                    setVideo(updatedData.video);
                    toast.success(data.message)
                } else {
                    toast(data.message)
                }
            }
        } catch (error) {
            console.error("Error while deleting the comment", error.message)
            toast.error("Error while deleting the comment")
        }

    }

    return (
        <div className="comment-block">
            <img src={avatar} alt="user-avatar" />
            <div className="comment-details">
                <div className="comment-user-details">
                    <p className="comment-username">@{username}</p>
                    <small className="comment-time">{formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}</small>
                    <small>{comment.edited && "•"}</small>
                    <small className="comment-edited">{comment.edited && "Edited"}</small>
                </div>
                <div className="actual-comment">
                    {!editingComment ? <p>{comment.comment}</p> :
                        <div className="add-comment">
                            <input type="text"
                                placeholder="Edit comment..."
                                value={editedComment}
                                onFocus={() => setShowCommentBtn(true)}
                                onChange={(e) => {
                                    setEditedComment(e.target.value)
                                }} />
                            <div className="add-comment-btns" style={{ display: showCommentBtn ? "flex" : "none" }}>
                                <span className="add-comment-btn add-comment-cancel" onClick={() => setEditingComment(false)}>Cancel</span>
                                <button className="add-comment-btn add-comment-submit" disabled={editedComment.trim() === ""} onClick={handleEditComment}>Submit</button>
                            </div>
                        </div>
                    }
                </div>
            </div>
            <span className="comment-three-dots" onClick={() => setShowCommentOption(!showCommenOption)}>
                <img src="https://img.icons8.com/?size=100&id=84119&format=png&color=FFFFFF" alt="comment-options" />
            </span>
            <div className="comment-options" style={{ display: showCommenOption ? "flex" : "none" }}>
                {comment?.user?._id === user?._id ?
                    <>
                        <div className="comment-option edit" onClick={() => {
                            setEditingComment(true)
                            setShowCommentOption(!showCommenOption)
                            setEditedComment(comment.comment)
                        }}>
                            <img src="https://img.icons8.com/?size=100&id=15069&format=png&color=FFFFFF" alt="edit-icon" />
                            <span>Edit</span>
                        </div>
                        <div className="comment-option delete" onClick={handleDeleteComment}>
                            <img src="https://img.icons8.com/?size=100&id=83238&format=png&color=FFFFFF" alt="delete" />
                            <span>Delete</span>
                        </div>
                    </> :
                    <div className="comment-option report">
                        <img src="https://img.icons8.com/?size=100&id=CAiO991xKc-Y&format=png&color=FFFFFF" alt="report" />
                        <span>Report</span>
                    </div>
                }
            </div>
        </div>
    )
}

export default Comment