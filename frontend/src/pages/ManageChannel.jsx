import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { USER_CHANNEL_UPDATE } from "../utils/API_CONFIG"
import MiniVideoTile from "../components/MiniVideoTile"
import { useConfirm } from "material-ui-confirm"
import { getProfile } from "../utils/authUtils"
import { logout, setUser } from "../utils/userSlice"

const MAX_BANNER_SIZE = 5 * 1024 * 1024;
const MAX_BANNER_SIZE_MB = Math.round(MAX_BANNER_SIZE / 1000000);

function ManageChannel() {
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chanEditMode, setChanEditMode] = useState(false)
  const [editingChanName, setEditingChanName] = useState(false)
  const [editingChanDesc, setEditingChanDesc] = useState(false)
  const [bannerPreview, setBannerPreview] = useState(null)

  const [updatedChanAvaURL, setUpdatedChanAvaURL] = useState(null)
  const [updatedChanBan, setUpdatedChanBan] = useState(null)
  const [updatedChanName, setUpdatedChanName] = useState("")
  const [updatedChanDesc, setUpdatedChanDesc] = useState("")

  const bannerInputRef = useRef()
  const token = useSelector(state => state?.user?.token)
  const { channelId } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!token) {
      toast.error("Looks like you are not signed in");
      if (location.pathname.startsWith(`/channel/manage/`)) {
        navigate("/");
      } else {
        navigate("/login");
      }
      return;
    }
  }, [token]);

  async function handleDeleteChannel() {
    try {
      const { confirmed } = await confirm({
        title: `Delete ${channel.channelName}?`,
        description: "This action is irreversible, you are about to delete your channel permanently",
        confirmationText: "Delete",
        cancellationText: "Cancel"
      })
      if (confirmed) {
        const res = await fetch(USER_CHANNEL_UPDATE, {
          method: "DELETE",
          headers: {
            "authorization": `Bearer ${token}`
          }
        })
        const data = await res.json()
        if (res.status === 200) {
          toast.success(data.message, { icon: "😥" })
          navigate("/")
        } else {
          toast.error(data.message || "Error creating channel")
        }
      }

      const result = await getProfile(token);
      if (result.expired) {
        toast.error("Session Expired, please login again")
        dispatch(logout());
      } else {
        dispatch(setUser(result.user));
      }
    } catch (error) {
      toast.error("Error while deleting channel")
      console.log("Error while deleting channel", error)
    }
  }

  async function handleSaveChannel() {
    setLoading(true)
    if (updatedChanBan) {
      if (updatedChanBan.size > MAX_BANNER_SIZE_MB) {
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
    }

    if (!updatedChanBan && !updatedChanName && !updatedChanDesc && !updatedChanAvaURL) {
      toast.error("Any one of the channel details needs to change to request for it")
      return
    }

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

    try {
      const res = await fetch(USER_CHANNEL_UPDATE, {
        method: "PUT",
        headers: {
          "authorization": `Bearer ${token}`
        },
        body: formData
      })
      const data = await res.json()
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

  function handleBannerChange(e) {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      setBannerPreview(URL.createObjectURL(file));
      setUpdatedChanBan(file)
    }
    e.target.value = ""
  }

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
              from: `/channel/manage/${channelId}`,
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
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    }
  }, [bannerPreview])
  
  return (<>
    {loading ? (
      <div className="loading-container">
        <div className="loading-msg"></div>
      </div>
    ) : (
      <div className="channel-page">
        <div className="channel-banner">
          <img src={bannerPreview ? bannerPreview : channel.channelBanner} alt="channelBanner" />
          <img
            src="https://img.icons8.com/?size=100&id=7EmcfPM09Gkp&format=png&color=FFFFFF"
            alt="edit-icon"
            onClick={() => bannerInputRef.current.click()}
            style={{ display: chanEditMode ? "block" : "none" }}
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
            <img src={updatedChanAvaURL ? updatedChanAvaURL : channel.channelAvatar} alt="channelAvatar" />
            <div style={{ display: chanEditMode ? "flex" : "none" }}>
              <img
                src="https://img.icons8.com/?size=100&id=7EmcfPM09Gkp&format=png&color=FFFFFF"
                alt="edit"
                className="avatar-edit"
                onClick={handleUpdateChannelAvatar}
              />
            </div>
          </div>
          <div className="profile-info">
            <div className="channel-name-container">
              <div className="channel-name-block">
                <h1>{channel.channelName}</h1>
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
                />
              </div>
              <img
                src="https://img.icons8.com/?size=100&id=71201&format=png&color=FFFFFF"
                alt="edit"
                className="edit-btn"
                style={{ display: chanEditMode ? "block" : "none" }}
                onClick={() => setEditingChanName(!editingChanName)}
              />
            </div>
            <div className="profile-meta">
              <strong>@{channel.owner.username}</strong>
              <span>•</span>
              <span>{channel.subscriberCount} subscriber{channel.subscriberCount > 1 ? "s" : ""}</span>
              <span>•</span>
              <span>{channel.videos.length} video{channel.videos.length > 1 ? "s" : ""}</span>
              <span>•</span>
              <span>created {new Date(channel.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
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
              />
              <img
                src="https://img.icons8.com/?size=100&id=71201&format=png&color=FFFFFF"
                alt="edit"
                className="edit-btn"
                style={{ display: chanEditMode ? "block" : "none" }}
                onClick={() => setEditingChanDesc(!editingChanDesc)}
              />
            </div>
            <div className="manage-channel-actions">
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
        <div className="channel-videos">
          {
            videos.length > 0 ?
              videos.map(video => {
                return <MiniVideoTile video={video} key={video._id} page="channel" />
              }) :
              <div className="no-videos-cta">
                <img src="https://www.gstatic.com/youtube/img/channels/core_channel_no_activity_dark.svg" alt="no-videos-cta" />
                <strong>Create content on any device</strong>
                <span>Upload and record at home or on the go. <br />Everything you make public will appear here.</span>
                <button>Upload Video</button>
              </div>
          }
        </div>
      </div>
    )}
  </>)
}

export default ManageChannel