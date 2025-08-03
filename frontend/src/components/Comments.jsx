import { useState } from "react"

function Comments() {
    const [showCommenOption, setShowCommentOption] = useState(false)

    return (
        <div className="comment-block">
            <img src="https://yt3.ggpht.com/RL6chOWqHqBsOhoeGW5360CyRXD4-YlsmbisJtVpZXHJt_sq2XcNJkOBGX8oL3PJCvMC9rA4=s88-c-k-c0x00ffffff-no-rj" alt="user-avatar" />
            <div className="comment-details">
                <div className="comment-user-details">
                    <p className="comment-username">@ProductiveLee</p>
                    <small className="comment-time">2 months ago</small>
                </div>
                <div className="actual-comment">
                    <p>Every time I hit snooze, I’m delaying my own future. It’s not about being a morning person—it's about owning that first hour and setting the tone for the next 5 years. One intentional hour changes everything.                      </p>
                </div>
            </div>
            <span className="comment-three-dots" onClick={() => setShowCommentOption(!showCommenOption)}>
                <img src="https://img.icons8.com/?size=100&id=84119&format=png&color=FFFFFF" alt="comment-options" />
            </span>
            <div className="comment-options" style={{ display: showCommenOption ? "flex" : "none" }}> {/** this should only be abled when the user is signed in */}
                <div className="comment-option edit">
                    <img src="https://img.icons8.com/?size=100&id=15069&format=png&color=FFFFFF" alt="edit-icon" />
                    <span>Edit</span>
                </div>
                <div className="comment-option delete">
                    <img src="https://img.icons8.com/?size=100&id=83238&format=png&color=FFFFFF" alt="delete" />
                    <span>Delete</span>
                </div>
            </div>
        </div>
    )
}

export default Comments