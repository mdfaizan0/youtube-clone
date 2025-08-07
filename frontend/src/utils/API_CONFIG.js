const API = import.meta.env.VITE_API_URL

const API_ENDPOINTS = {
    CHANNEL_CREATE: `${API}/api/channel/create`,
    USER_CHANNEL_UPDATE: `${API}/api/channel/me`,
    GET_CHANNEL: `${API}/api/channel`, // need channelId
    SIGNIN: `${API}/api/auth/signin`,
    SIGNUP: `${API}/api/auth/signup`,
    GET_PROFILE: `${API}/api/auth/profile`,
    UPLOAD_VID: `${API}/api/video/upload`,
    ALL_VIDEOS: `${API}/api/video/all`, // get all videos
    PLAY_VIDEO: `${API}/api/video/watch`, // need videoId
    SEARCH: `${API}/api/video/search`, // need query
    COMMENT: `${API}/api/video/comment`, // only videoId to add comment, videoId and commentId to edit/delete comment
    USER_UPDATE_VIDEO: `${API}/api/video/update`, // need channelId and videoId to perform edit/delete
    REACT_VIDEO: `${API}/api/video/react`, // need videoId to react
    SUB_CHANNEL: `${API}/api/channel/subscribe`, // need channelId to subscribe
}

export const {
    CHANNEL_CREATE,
    USER_CHANNEL_UPDATE,
    GET_CHANNEL,
    SIGNIN,
    SIGNUP,
    GET_PROFILE,
    UPLOAD_VID,
    ALL_VIDEOS,
    PLAY_VIDEO,
    SEARCH,
    COMMENT,
    USER_UPDATE_VIDEO,
    REACT_VIDEO,
    SUB_CHANNEL
} = API_ENDPOINTS