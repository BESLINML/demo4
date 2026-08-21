const API_URL = "http://localhost:8080/api/products";

const IMAGE_API_URL =
    "http://localhost:8080/api/images/upload";


// =====================================================
// GET ALL PRODUCTS
// =====================================================

export const getProducts = async () => {

    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    return response.json();
};


// =====================================================
// ADD PRODUCT
// =====================================================

export const addProduct = async (product) => {

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(product)

    });

    if (!response.ok) {

        const errorText = await response.text();

        throw new Error(
            `Failed to add product: ${response.status} ${errorText}`
        );
    }

    return response.json();
};


// =====================================================
// UPDATE PRODUCT
// =====================================================

export const updateProduct = async (
    id,
    product
) => {

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(product)
        }
    );

    if (!response.ok) {

        const errorText = await response.text();

        throw new Error(
            `Failed to update product: ${response.status} ${errorText}`
        );
    }

    return response.json();
};


// =====================================================
// DELETE PRODUCT
// =====================================================

export const deleteProduct = async (id) => {

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {

        const errorText = await response.text();

        throw new Error(
            `Failed to delete product: ${response.status} ${errorText}`
        );
    }

    return response.text();
};


// =====================================================
// UPLOAD IMAGE
// =====================================================

export const uploadImage = async (imageFile) => {

    // =================================================
    // CHECK FILE
    // =================================================

    if (!imageFile) {
        throw new Error("Please select an image");
    }


    // =================================================
    // CHECK IMAGE TYPE
    // =================================================

    if (!imageFile.type.startsWith("image/")) {

        throw new Error(
            `${imageFile.name} is not a valid image`
        );
    }


    // =================================================
    // MAX FILE SIZE
    // 20 MB
    // =================================================

    const maxSize =
        20 * 1024 * 1024;


    if (imageFile.size > maxSize) {

        throw new Error(
            `${imageFile.name} is larger than 20 MB`
        );
    }


    // =================================================
    // FORM DATA
    // =================================================

    const formData = new FormData();

    formData.append(
        "file",
        imageFile
    );


    // =================================================
    // UPLOAD
    // =================================================

    const response = await fetch(
        IMAGE_API_URL,
        {
            method: "POST",
            body: formData
        }
    );


    // =================================================
    // ERROR
    // =================================================

    if (!response.ok) {

        let message =
            "Image upload failed";

        try {

            const errorText =
                await response.text();

            if (errorText) {
                message = errorText;
            }

        } catch {
            // Ignore response parsing error
        }

        throw new Error(
            `Image upload failed: ${response.status} ${message}`
        );
    }


    // =================================================
    // RETURN IMAGE URL
    // =================================================

    return response.text();
};