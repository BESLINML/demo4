import axios from "axios";

const API_URL = "http://localhost:8080/api/banners";


// =====================================================
// GET ALL BANNERS
// =====================================================

export const getBanners = async () => {

    const response = await axios.get(API_URL);

    return response.data;
};


// =====================================================
// GET ONE BANNER
// =====================================================

export const getBanner = async (id) => {

    const response = await axios.get(
        `${API_URL}/${id}`
    );

    return response.data;
};


// =====================================================
// ADD BANNER
// =====================================================

export const addBanner = async (banner) => {

    const response = await axios.post(
        API_URL,
        banner,
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    return response.data;
};


// =====================================================
// UPDATE BANNER
// =====================================================

export const updateBanner = async (
    id,
    banner
) => {

    const response = await axios.put(
        `${API_URL}/${id}`,
        banner,
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    return response.data;
};


// =====================================================
// DELETE BANNER
// =====================================================

export const deleteBanner = async (id) => {

    const response = await axios.delete(
        `${API_URL}/${id}`
    );

    return response.data;
};