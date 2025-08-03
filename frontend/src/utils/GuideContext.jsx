import { createContext, useState } from "react";

export const GuideContext = createContext({
    showGuide: false,
    setShowGuide: () => { }
})

export const GuideProvider = ({ children }) => {
    const [showGuide, setShowGuide] = useState(false)

    return (
        <GuideContext.Provider value={{ showGuide, setShowGuide }}>
            {children}
        </GuideContext.Provider>
    )
}