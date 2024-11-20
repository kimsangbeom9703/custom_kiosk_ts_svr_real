window.addEventListener("DOMContentLoaded", () => {
    const replaceText = (selector: string, text: string) => {
        const element = document.getElementById(selector);
        if (element) {
            element.innerText = text;
        }
    };

    for (const type of ["chrome", "node", "electron"]) {
        const version = process.versions[type as keyof NodeJS.ProcessVersions];
        // undefined일 경우 기본값을 설정하여 string 타입만을 전달하도록 처리
        replaceText(`${type}-version`, version || 'Unknown');
    }

    let today = new Date();
    console.log(today);
});
