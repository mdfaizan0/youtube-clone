import { createContext, useState } from "react";

// exporting the GuideContext with showGuide default as false and setShowGuide to toggle showGuide
export const GuideContext = createContext({
    showGuide: false,
    setShowGuide: () => { }
})

// exporting GuideProvider by binding it with GuideContext to wrap whole app with GuideProvider to give access of showGuide context to whole app
export const GuideProvider = ({ children }) => {
    const [showGuide, setShowGuide] = useState(false)

    return (
        <GuideContext.Provider value={{ showGuide, setShowGuide }}>
            {children}
        </GuideContext.Provider>
    )
}