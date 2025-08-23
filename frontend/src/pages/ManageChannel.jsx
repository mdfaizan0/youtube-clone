import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { USER_CHANNEL_UPDATE, USER_UPDATE_VIDEO } from "../utils/API_CONFIG"
import MiniVideoTile from "../components/MiniVideoTile"
import { useConfirm } from "material-ui-confirm"
import { getProfile } from "../utils/authUtils"
import { logout, setUser } from "../utils/userSlice"
import VideoEdit from "../components/VideoEdit"

const MAX_BANNER_SIZE = 5 * 1024 * 1024;
const MAX_BANNER_SIZE_MB = Math.round(MAX_BANNER_SIZE / 1000000);

function ManageChannel() {
  // setting utility states
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chanEditMode, setChanEditMode] = useState(false)
  const [editingChanName, setEditingChanName] = useState(false)
  const [editingChanDesc, setEditingChanDesc] = useState(false)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [isVideoEditOpen, setIsVideoEditOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [isNewVideo, setIsNewVideo] = useState(false)

  // states for updated channel details
  const [updatedChanAvaURL, setUpdatedChanAvaURL] = useState(null)
  const [updatedChanBan, setUpdatedChanBan] = useState(null)
  const [updatedChanName, setUpdatedChanName] = useState("")
  const [updatedChanDesc, setUpdatedChanDesc] = useState("")

  // bannerInputRef - setting a reference point of thumbnail using useRef and getting token
  const bannerInputRef = useRef()
  const token = useSelector(state => state?.user?.token)
  // setting rrd hooks, confirm from "matrial-ui-confirm" and searchParams from rrd to check if it is "?upload=true" to cater uploading videos
  const navigate = useNavigate()
  const confirm = useConfirm()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()

  // setting existing name and description while editing channel details
  useEffect(() => {
    setUpdatedChanDesc(channel?.channelDescription || "")
    setUpdatedChanName(channel?.channelName || "")
  }, [channel])

  // checking if search params is true, 
  // if yes, open the modal with no previous details na toggle isNewVideo to send updated boolean value VideoEdit.jsx, to act accordingly
  useEffect(() => {
    if (searchParams.get("upload") === "true") {
      setIsVideoEditOpen(true)
      setSelectedVideo(null)
      setIsNewVideo(!isNewVideo)
    }
  }, [searchParams])

  // protecting route when user is not logged in
  useEffect(() => {
    if (!token) {
      toast.error("Looks like you are not signed in");
      navigate("/login")
      return;
    }
  }, [token]);

  // handling video editing by opening the modal and setting state of received selected video 
  function handleVideoEdit(videoData) {
    setIsVideoEditOpen(true)
    setSelectedVideo(videoData)
  }

  // handling video deletion after getting confirmation using "material-ui-confirm"
  async function handleVideoDelete(video) {
    try {
      const { confirmed } = await confirm({
        title: `Delete ${video.title}?`,
        description: "This action is irreversible, you are about to delete the video permanently",
        confirmationText: "Delete",
        cancellationText: "Cancel"
      })
      setLoading(true)
      // if confirmed, sending delete request to BE with relevant params and token
      if (confirmed) {
        const res = await fetch(`${USER_UPDATE_VIDEO}/${channel._id}/${video._id}`, {
          method: "DELETE",
          headers: {
            "authorization": `Bearer ${token}`
          }
        })
        const data = await res.json()
        // if result is 200, show toast, set updated channel and set all the videos too, to update the removed video from UI
        if (res.status === 200) {
          toast.success(data.message)
          setChannel(data.channel)
          setVideos(data.channel.videos)
        } else {
          toast.error(data.message || "Error deleting video")
        }
      }
    } catch (error) {
      toast.error("Error while deleting video")
      console.log("Error while deleting video", error)
    } finally {
      setLoading(false)
    }
  }

  // handling channel deletion once confirmed
  async function handleDeleteChannel() {
    try {
      const { confirmed } = await confirm({
        title: `Delete ${channel.channelName}?`,
        description: "This action is irreversible, you are about to delete your channel permanently",
        confirmationText: "Delete",
        cancellationText: "Cancel"
      })
      // if not confirmed, get out of the func
      if (!confirmed) return;

      // if confirmed, calling toast.promise and self-executing the function to call backend for channel deletion 
      // while it shows a loading spinner 
      // eventually showing completion or error message from BE
      await toast.promise(
        (async () => {
          const res = await fetch(USER_CHANNEL_UPDATE, {
            method: "DELETE",
            headers: {
              authorization: `Bearer ${token}`
            }
          });
          const data = await res.json();

          if (res.status !== 200) {
            throw new Error(data.message || "Error deleting channel");
          }

          navigate("/");
          return data.message;
        })(),
        {
          loading: "Deleting channel...",
          success: (message) => message || "Channel deleted successfully",
          error: (err) => err.message || "Failed to delete channel"
        }
      );

      // setting profile data to redux again for updated data to be shown on header
      const result = await getProfile(token);
      if (result.expired) {
        toast.error("Session Expired, please login again")
        dispatch(logout());
      } else {
        dispatch(setUser(result.user));
      }
    } catch (error) {
      console.log("Error while deleting channel", error)
    }
  }

  // handing submission of edited channel details
  async function handleSaveChannel() {
    // if banner is updated
    // check format is amongst allowed formats, if not, show toast 
    // check size is more than max size of 5 mb 
    // check if all anyone of the details is received
    if (updatedChanBan) {
      const allowed_formats = ["jpg", "jpeg", "png", "webp"]
      const fileName = updatedChanBan.name.split(".")
      const fileType = fileName[fileName.length - 1].toLowerCase()
      if (!allowed_formats.includes(fileType)) {
        toast.error(`Sorry, but we don't allow ${fileType} filetypes`)
        toast.error("The allowed formats : jpg, jpeg, png, webp")
        return
      }
      if (updatedChanBan.size > MAX_BANNER_SIZE) {
        toast.error(`The maximum file size for channel banner is ${MAX_BANNER_SIZE_MB} MB`)
        return
      }
    }

    if (!updatedChanBan && !updatedChanName && !updatedChanDesc && !updatedChanAvaURL) {
      toast.error("Please update at least one channel detail before saving changes")
      return
    }

    // showing loading while the data gets processed and checking the data exists before setting to formData
    setLoading(true)
    const formData = new FormData();
    if (updatedChanName) {
      formData.append("channelName", updatedChanName)
    }
    if (updatedChanDesc) {
      formData.append("channelDescription", updatedChanDesc)
    }
    if (updatedChanAvaURL) {
      formData.append("channelAvatar", updatedChanAvaURL)
    }
    if (updatedChanBan) {
      formData.append("channelBanner", updatedChanBan)
    }

    // sending data to backend with updated data
    try {
      const res = await fetch(USER_CHANNEL_UPDATE, {
        method: "PUT",
        headers: {
          "authorization": `Bearer ${token}`
        },
        body: formData
      })
      const data = await res.json()
      // setting updated channel details
      setChannel(data.updatedDetails)
      if (res.status === 200) {
        toast.success(data.message)
      } else {
        toast.error(data.message || "Error editing channel")
      }
    } catch (error) {
      console.error("Error while editing channel", error)
      toast.error("Error while editing channel")
    } finally {
      setLoading(false)
    }
  }

  // handling banner change to show the selected banner to preview for the user before submitting, 
  // also, removing previous preview
  function handleBannerChange(e) {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      setBannerPreview(URL.createObjectURL(file));
      setUpdatedChanBan(file)
    }
    e.target.value = ""
  }

  // handling closeIt, to close the model and setting the route to "/channel/manage" to remove "upload=true"
  function handleModalClose() {
    setIsVideoEditOpen(false)
    navigate("/channel/manage")
    setIsNewVideo(false)
  }

  // handling cloudinary upload widget for channel avatar configuring and calling it
  function handleUpdateChannelAvatar() {
    const widget = window.cloudinary.createUploadWidget({
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_CHANNEL,
      folder: "channelAvatars",
      sources: ["local"],
      cropping: true,
      croppingAspectRatio: 1,
      croppingDefaultSelectionRatio: 0.8,
      croppingShowDimensions: true,
      croppingCoordinatesMode: "custom",
      multiple: false,
      showSkipCropButton: false,
      croppingShowBackButton: true,
      clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
      maxFileSize: 3 * 1024 * 1024,
      resourceType: "image",
      showCompletedButton: true,
      showUploadMoreButton: false,
      publicId: channel?.owner?.username ? `channelAvatar_${channel?.owner?.username}_${Date.now()}` : `channelAvatar_${Date.now()}`,
      styles: {
        palette: {
          window: "#1c1c1c",
          sourceBg: "#222222",
          windowBorder: "#8E9FBF",
          tabIcon: "#FFFFFF",
          inactiveTabIcon: "#8E9FBF",
          menuIcons: "#CCCCCC",
          link: "#5ACCFF",
          action: "#FF620C",
          inProgress: "#00BFFF",
          complete: "#20B832",
          error: "#F44235",
          textDark: "#000000",
          textLight: "#FFFFFF",
        }
      }
    }, (error, result) => {
      if (error) {
        console.error("Upload error:", error);
        return;
      }
      if (result.event === "success") {
        const url = result.info.secure_url;
        setUpdatedChanAvaURL(url);
        widget.close();
      }
    });

    if (widget) {
      widget.open();
    }
  }

  // getting newChannel as parameter and setting the updated channel and video details to channel and video states
  function handleAfterSave(newChannel) {
    setChannel(newChannel)
    setVideos(newChannel.videos)
  }

  // fetching user channel everytime the loading state is changed
  useEffect(() => {
    if (!token) return
    async function fetchUserChannel() {
      try {
        const res = await fetch(USER_CHANNEL_UPDATE, {
          headers: {
            "authorization": `Bearer ${token}`
          }
        })
        if (res.status === 404 || res.status === 500 || res.status === 403) {
          navigate("/404", {
            replace: true,
            state: {
              from: `/channel/manage/`,
              status: res.status,
              messaage: "Channel not found"
            }
          })
          return
        }
        const data = await res.json()
        setChannel(data.channel)
        setVideos(data.channel.videos)
      } catch (error) {
        toast.error("Error while fetching user channel")
        console.error("Error while fetching user channel", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserChannel()
  }, [loading])

  useEffect(() => {
    if (channel?.channelName) {
      document.title = `${channel?.channelName} - Manage Your Channel`
    }
  }, [channel])

  // removing bannerPreview here too for safety and consistency
  useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    }
  }, [bannerPreview])

  return (
    <>
      {loading ? (
        <div className="loading-container">
          <div className="loading-msg"></div>
        </div>
      ) : (
        <div className="channel-page" style={{ pointerEvents: isVideoEditOpen ? "none" : "auto", userSelect: isVideoEditOpen ? "none" : "auto" }}>
          <div className="channel-banner">
            <img src={bannerPreview ? bannerPreview : channel.channelBanner} alt="channelBanner" loading="lazy" />
            <img
              src="https://img.icons8.com/?size=100&id=7EmcfPM09Gkp&format=png&color=FFFFFF"
              alt="edit-icon"
              onClick={() => bannerInputRef.current.click()}
              style={{ display: chanEditMode ? "block" : "none" }}
              loading="lazy"
            />
            <input
              type="file"
              accept="image/jpg, image/jpeg, image/png, image/webp"
              onChange={handleBannerChange}
              ref={bannerInputRef}
              style={{ display: "none" }}
            />
          </div>
          <div className="channel-profile">
            <div className="channel-avatar">
              <img src={updatedChanAvaURL ? updatedChanAvaURL : channel.channelAvatar} alt="channelAvatar" loading="lazy" />
              <div style={{ display: chanEditMode ? "flex" : "none" }}>
                <img
                  src="https://img.icons8.com/?size=100&id=7EmcfPM09Gkp&format=png&color=FFFFFF"
                  alt="edit"
                  className="avatar-edit"
                  onClick={handleUpdateChannelAvatar}
                  loading="lazy"
                />
              </div>
            </div>
            <div className="profile-info">
              <div className="channel-name-container">
                <div className="channel-name-block">
                  <span>{channel.channelName}</span>
                  <img
                    src="https://img.icons8.com/?size=100&id=36872&format=png&color=FFFFFF"
                    alt="verified-status"
                    title="Verified"
                    style={channel?.verified ? { display: "block" } : { display: "none" }}
                    loading="lazy" />
                  <input
                    type="text"
                    placeholder="Enter a new channel name"
                    style={{ display: editingChanName ? "block" : "none" }}
                    onChange={(e) => setUpdatedChanName(e.target.value)}
                    value={updatedChanName}
                  />
                </div>
                <img
                  src="https://img.icons8.com/?size=100&id=71201&format=png&color=FFFFFF"
                  alt="edit"
                  className="edit-btn"
                  style={{ display: chanEditMode ? "block" : "none" }}
                  onClick={() => setEditingChanName(!editingChanName)}
                  loading="lazy"
                />
              </div>
              <div className="profile-meta">
                <div className="profile-username">
                  <strong>@{channel.owner.username}</strong>
                </div>
                <div className="profile-information">
                  <span>•</span>
                  <span>{channel.subscriberCount} subscriber{channel.subscriberCount > 1 ? "s" : ""}</span>
                  <span>•</span>
                  <span>{channel.videos.length} video{channel.videos.length > 1 ? "s" : ""}</span>
                  <span>•</span>
                  <span>created {new Date(channel.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>
              <div className="channel-descrip-block">
                <p>{channel.channelDescription}</p>
                <textarea
                  type="text"
                  placeholder="Enter a new channel description"
                  style={{ display: editingChanDesc ? "block" : "none" }}
                  rows="1"
                  cols="61"
                  maxLength="300"
                  onChange={(e) => setUpdatedChanDesc(e.target.value)}
                  value={updatedChanDesc}
                />
                <img
                  src="https://img.icons8.com/?size=100&id=71201&format=png&color=FFFFFF"
                  alt="edit"
                  className="edit-btn"
                  style={{ display: chanEditMode ? "block" : "none" }}
                  onClick={() => setEditingChanDesc(!editingChanDesc)}
                  loading="lazy"
                />
              </div>
              <div className="manage-channel-actions">
                <span className="mobile-upload-button" onClick={() => navigate("/channel/manage?upload=true")}>Upload</span>
                <button onClick={() => setChanEditMode(!chanEditMode)} style={{ display: chanEditMode ? "none" : "block" }}>Edit Channel</button>
                <button
                  onClick={() => {
                    setChanEditMode(!chanEditMode)
                    setEditingChanName(false)
                    setEditingChanDesc(false)
                    setUpdatedChanAvaURL(null)
                    setBannerPreview(null)
                  }}
                  style={{ display: chanEditMode ? "block" : "none" }}>Cancel</button>
                <button style={{ display: chanEditMode ? "none" : "block" }} onClick={handleDeleteChannel}>Delete Channel</button>
                <button onClick={() => {
                  setChanEditMode(!chanEditMode)
                  handleSaveChannel()
                  setEditingChanName(false)
                  setEditingChanDesc(false)
                  setUpdatedChanAvaURL(null)
                  setBannerPreview(null)
                }} style={{ display: chanEditMode ? "block" : "none" }}>Save Channel</button>
              </div>
            </div>
          </div>
          <span>Videos</span>
          <div className="channel-videos" style={{ display: videos.length === 0 ? "flex" : "grid" }}>
            {
              videos.length > 0 ?
                videos.map(video => {
                  return <MiniVideoTile video={video} key={video._id} page="channel" isOwner={true} handleVideoEdit={handleVideoEdit} handleVideoDelete={handleVideoDelete} />
                }) :
                <div className="no-videos-cta">
                  <img src="https://www.gstatic.com/youtube/img/channels/core_channel_no_activity_dark.svg" alt="no-videos-cta" loading="lazy" />
                  <strong>Create content on any device</strong>
                  <span>Upload and record at home or on the go. <br />Everything you make public will appear here.</span>
                  <button onClick={() => navigate("/channel/manage?upload=true")}>Upload Video</button>
                </div>
            }
          </div>
        </div>
      )}
      {isVideoEditOpen ? <VideoEdit video={selectedVideo} closeIt={handleModalClose} handleAfterSave={handleAfterSave} isNewVideo={isNewVideo} /> : null}
    </>
  )
}

export default ManageChannel