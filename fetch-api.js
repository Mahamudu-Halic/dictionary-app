export const fetchApi = async (word) => {
    const api = "https://api.dictionaryapi.dev/api/v2/entries/en/";
    try {

        const response = await fetch(api + word);
        const data = await response.json();

        if (!response.ok) {
            return {status: response.status, data};
        }

        return {data, status: response.status}
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            return {
                status: "offline",
                data: {
                    title: "Connection timed out",
                    message: error.message + ":",
                    resolution: "Check your device internet connection"
                }
            };
        }

        return {status: 'error', data: {title: "Something went wrong", message: error.message, resolution: ""}};

    }
}
