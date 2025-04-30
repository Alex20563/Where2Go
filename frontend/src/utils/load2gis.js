let isLoaded = false;
let loadingPromise = null;

export const load2GIS = () => {
    if (isLoaded && window.DG && typeof window.DG.map === "function") {
        return Promise.resolve(window.DG);
    }

    if (loadingPromise) {
        return loadingPromise;
    }

    loadingPromise = new Promise((resolve, reject) => {
        if (window.DG && typeof window.DG.map === "function") {
            isLoaded = true;
            resolve(window.DG);
            return;
        }

        const existingScript = document.querySelector("script[src*='maps.api.2gis.ru/2.0/loader.js']");
        if (existingScript) {
            const interval = setInterval(() => {
                if (window.DG && typeof window.DG.map === "function") {
                    clearInterval(interval);
                    isLoaded = true;
                    resolve(window.DG);
                }
            }, 100);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://maps.api.2gis.ru/2.0/loader.js?pkg=full";
        script.async = true;
        script.onload = () => {
            const interval = setInterval(() => {
                if (window.DG && typeof window.DG.map === "function") {
                    clearInterval(interval);
                    isLoaded = true;
                    resolve(window.DG);
                }
            }, 100);
        };
        script.onerror = () => reject(new Error("Ошибка загрузки скрипта 2GIS"));
        document.body.appendChild(script);
    });
    return loadingPromise;
};
