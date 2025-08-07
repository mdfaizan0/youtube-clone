export function formatViews(views) {
    let formattedViews = views

    if (views >= 1000000000) {
        formattedViews = formattedViews / 1000000000
        formattedViews = `${Math.floor(formattedViews)}B views`
    } else if (views >= 1000000) {
        formattedViews = formattedViews / 1000000
        let rounded = Math.round(formattedViews * 10) / 10

        if (rounded >= 1000) {
            formattedViews = `${Math.floor(rounded / 1000)}B views`
        } else if (rounded === Math.floor(rounded)) {
            formattedViews = `${Math.floor(rounded)}M views`
        } else {
            formattedViews = `${rounded.toFixed(1)}M views`
        }
    } else if (views >= 1000) {
        formattedViews = Math.floor(formattedViews / 1000)
        formattedViews = `${formattedViews}K views`
    } else {
        formattedViews = `${formattedViews} views`
    }

    return formattedViews
}

export function convertStoMs(seconds) {
    let minutes = Math.floor(seconds / 60);
    let extraSeconds = seconds % 60;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    extraSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;
    return `${minutes}:${extraSeconds}`
}