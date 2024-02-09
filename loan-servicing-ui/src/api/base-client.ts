import axios from "axios";

export const tryGetApiData = async (route: string) => {
    try {
        const response = await axios.get(`${process.env.API_URL}/${route}`);
        return response.data;
    } catch {
        return null;
    }
};