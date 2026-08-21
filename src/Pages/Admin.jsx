import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadImage
} from "../api/ProductApi";

import {
    getBanners,
    addBanner,
    updateBanner,
    deleteBanner
} from "../api/BannerApi";


// =====================================================
// ADMIN
// =====================================================

export default function Admin() {

    // =====================================================
    // SECTION REFS
    // =====================================================

    const bannerManagementRef = useRef(null);

    const productManagementRef = useRef(null);


    // =====================================================
    // PRODUCTS
    // =====================================================

    const [products, setProducts] = useState([]);

    const [loadingProducts, setLoadingProducts] =
        useState(true);


    // =====================================================
    // PRODUCT EDITING
    // =====================================================

    const [editingId, setEditingId] =
        useState(null);


    // =====================================================
    // PRODUCT IMAGE FILES
    // =====================================================

    const [imageFiles, setImageFiles] =
        useState([]);


    // =====================================================
    // PRODUCT IMAGE PREVIEW
    // =====================================================

    const [imagePreview, setImagePreview] =
        useState([]);


    // =====================================================
    // PRODUCT LOADING
    // =====================================================

    const [loading, setLoading] =
        useState(false);


    // =====================================================
    // PRODUCT FORM
    // =====================================================

    const [form, setForm] = useState({

        name: "",

        category: "",

        subcategory: "",

        price: "",

        offerprice: "",

        description: "",

        image: ""

    });


    // =====================================================
    // BANNERS
    // =====================================================

    const [banners, setBanners] =
        useState([]);

    const [loadingBanners, setLoadingBanners] =
        useState(true);


    // =====================================================
    // BANNER EDITING
    // =====================================================

    const [editingBannerId, setEditingBannerId] =
        useState(null);


    // =====================================================
    // BANNER FILE
    // =====================================================

    const [bannerFile, setBannerFile] =
        useState(null);


    // =====================================================
    // BANNER PREVIEW
    // =====================================================

    const [bannerPreview, setBannerPreview] =
        useState("");


    // =====================================================
    // BANNER FORM
    // =====================================================

    const [bannerForm, setBannerForm] =
        useState({

            image: "",

            title: "",

            description: ""

        });


    // =====================================================
    // BANNER LOADING
    // =====================================================

    const [bannerLoading, setBannerLoading] =
        useState(false);


    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

    const loadProducts = async () => {

        try {

            setLoadingProducts(true);

            const data = await getProducts();

            console.log("Products:", data);

            setProducts(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Error loading products:",
                error
            );

            alert(
                "Failed to load products"
            );

        } finally {

            setLoadingProducts(false);

        }

    };


    // =====================================================
    // LOAD BANNERS
    // =====================================================

    const loadBanners = async () => {

        try {

            setLoadingBanners(true);

            const data = await getBanners();

            console.log("Banners:", data);

            setBanners(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Error loading banners:",
                error
            );

            alert(
                "Failed to load banners"
            );

        } finally {

            setLoadingBanners(false);

        }

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadProducts();

        loadBanners();

    }, []);


    // =====================================================
    // LOAD PRODUCT FROM OTHER PAGE
    // =====================================================

    useEffect(() => {

        const editingProduct =
            localStorage.getItem(
                "editingProduct"
            );

        if (!editingProduct) {
            return;
        }

        try {

            const product =
                JSON.parse(
                    editingProduct
                );

            if (product) {

                handleEdit(product);

            }

        } catch (error) {

            console.error(
                "Editing product error:",
                error
            );

        }

        localStorage.removeItem(
            "editingProduct"
        );

    }, []);


    // =====================================================
    // PRODUCT INPUT CHANGE
    // =====================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setForm(previous => ({

            ...previous,

            [name]: value

        }));

    };


    // =====================================================
    // GET PRODUCT IMAGES
    // =====================================================

    const getProductImages = (image) => {

        if (!image) {

            return [];

        }


        // =================================================
        // ALREADY ARRAY
        // =================================================

        if (Array.isArray(image)) {

            return image.filter(
                item =>
                    typeof item === "string" &&
                    item.trim() !== ""
            );

        }


        // =================================================
        // STRING
        // =================================================

        if (typeof image === "string") {

            const trimmed =
                image.trim();

            if (!trimmed) {

                return [];

            }


            // =================================================
            // JSON ARRAY
            // =================================================

            try {

                const parsed =
                    JSON.parse(trimmed);

                if (Array.isArray(parsed)) {

                    return parsed.filter(
                        item =>
                            typeof item === "string" &&
                            item.trim() !== ""
                    );

                }

            } catch (error) {

                // Normal string

            }


            // =================================================
            // COMMA SEPARATED
            // =================================================

            if (trimmed.includes(",")) {

                return trimmed
                    .split(",")
                    .map(
                        item =>
                            item.trim()
                    )
                    .filter(Boolean);

            }


            return [trimmed];

        }

        return [];

    };


    // =====================================================
    // PRODUCT IMAGE CHANGE
    // =====================================================

    const handleImageChange = (event) => {

        const files =
            Array.from(
                event.target.files || []
            );

        if (files.length === 0) {

            return;

        }

        setImageFiles(files);

        const previews =
            files.map(
                file =>
                    URL.createObjectURL(file)
            );

        setImagePreview(previews);

    };


    // =====================================================
    // REMOVE PRODUCT IMAGE
    // =====================================================

    const removeSelectedImage = (index) => {

        setImageFiles(previous =>
            previous.filter(
                (_, i) =>
                    i !== index
            )
        );

        setImagePreview(previous =>
            previous.filter(
                (_, i) =>
                    i !== index
            )
        );

    };


    // =====================================================
    // SUBMIT PRODUCT
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (loading) {

            return;

        }

        setLoading(true);

        try {

            let imageUrl =
                form.image || "";


            // =================================================
            // UPLOAD NEW PRODUCT IMAGES
            // =================================================

            if (imageFiles.length > 0) {

                const uploadedImages = [];

                for (
                    const file of imageFiles
                ) {

                    const url =
                        await uploadImage(
                            file
                        );

                    uploadedImages.push(
                        url
                    );

                }

                imageUrl =
                    JSON.stringify(
                        uploadedImages
                    );

            }


            // =================================================
            // PRODUCT OBJECT
            // =================================================

            const product = {

                name:
                    form.name.trim(),

                category:
                    form.category.trim(),

                subcategory:
                    form.subcategory.trim(),

                price:
                    Number(form.price),

                offerprice:
                    Number(
                        form.offerprice
                    ),

                description:
                    form.description.trim(),

                image:
                    imageUrl

            };


            // =================================================
            // UPDATE
            // =================================================

            if (editingId) {

                await updateProduct(
                    editingId,
                    product
                );

                alert(
                    "Product updated successfully"
                );

            }


            // =================================================
            // ADD
            // =================================================

            else {

                await addProduct(
                    product
                );

                alert(
                    "Product added successfully"
                );

            }


            resetForm();

            await loadProducts();

        } catch (error) {

            console.error(
                "Product save error:",
                error
            );

            console.error(
                "Response:",
                error?.response?.data
            );

            alert(
                error?.response?.data?.message ||
                "Something went wrong"
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // EDIT PRODUCT
    // =====================================================

    const handleEdit = (product) => {

        // =================================================
        // SET EDITING PRODUCT
        // =================================================

        setEditingId(
            product.id
        );


        // =================================================
        // SET FORM
        // =================================================

        setForm({

            name:
                product.name || "",

            category:
                product.category || "",

            subcategory:
                product.subcategory || "",

            price:
                product.price ?? "",

            offerprice:
                product.offerprice ?? "",

            description:
                product.description || "",

            image:
                product.image || ""

        });


        // =================================================
        // EXISTING IMAGES
        // =================================================

        const existingImages =
            getProductImages(
                product.image
            );

        setImagePreview(
            existingImages
        );

        setImageFiles([]);


        // =================================================
        // SCROLL TO PRODUCT MANAGEMENT
        // =================================================

        setTimeout(() => {

            productManagementRef.current?.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }, 100);

    };


    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    const handleDelete = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this product?"
            );

        if (!confirmed) {

            return;

        }

        try {

            await deleteProduct(id);

            setProducts(previous =>
                previous.filter(
                    product =>
                        product.id !== id
                )
            );


            if (
                String(editingId) ===
                String(id)
            ) {

                resetForm();

            }

            alert(
                "Product deleted successfully"
            );

        } catch (error) {

            console.error(
                "Delete error:",
                error
            );

            alert(
                "Failed to delete product"
            );

        }

    };


    // =====================================================
    // RESET PRODUCT FORM
    // =====================================================

    const resetForm = () => {

        setEditingId(null);

        setImageFiles([]);

        setImagePreview([]);

        setForm({

            name: "",

            category: "",

            subcategory: "",

            price: "",

            offerprice: "",

            description: "",

            image: ""

        });


        const fileInput =
            document.getElementById(
                "product-images"
            );

        if (fileInput) {

            fileInput.value = "";

        }

    };


    // =====================================================
    // GET FIRST PRODUCT IMAGE
    // =====================================================

    const getFirstImage = (image) => {

        const images =
            getProductImages(
                image
            );

        return images.length > 0
            ? images[0]
            : "/placeholder.png";

    };


    // =====================================================
    // BANNER INPUT CHANGE
    // =====================================================

    const handleBannerChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setBannerForm(previous => ({

            ...previous,

            [name]: value

        }));

    };


    // =====================================================
    // BANNER IMAGE CHANGE
    // =====================================================

    const handleBannerImageChange =
        (event) => {

            const file =
                event.target.files?.[0];

            if (!file) {

                return;

            }

            setBannerFile(file);

            setBannerPreview(
                URL.createObjectURL(
                    file
                )
            );

        };


    // =====================================================
    // ADD / UPDATE BANNER
    // =====================================================

    const handleBannerSubmit =
        async (event) => {

            event.preventDefault();

            if (bannerLoading) {

                return;

            }

            setBannerLoading(true);

            try {

                let imageUrl =
                    bannerForm.image || "";


                // =================================================
                // UPLOAD BANNER IMAGE
                // =================================================

                if (bannerFile) {

                    imageUrl =
                        await uploadImage(
                            bannerFile
                        );

                }


                // =================================================
                // BANNER OBJECT
                // =================================================

                const banner = {

                    image:
                        imageUrl,

                    title:
                        bannerForm.title.trim(),

                    description:
                        bannerForm.description.trim()

                };


                // =================================================
                // UPDATE
                // =================================================

                if (editingBannerId) {

                    await updateBanner(
                        editingBannerId,
                        banner
                    );

                    alert(
                        "Banner updated successfully"
                    );

                }


                // =================================================
                // ADD
                // =================================================

                else {

                    await addBanner(
                        banner
                    );

                    alert(
                        "Banner added successfully"
                    );

                }


                resetBannerForm();

                await loadBanners();

            } catch (error) {

                console.error(
                    "Banner save error:",
                    error
                );

                console.error(
                    "Banner response:",
                    error?.response?.data
                );

                alert(
                    "Failed to save banner"
                );

            } finally {

                setBannerLoading(false);

            }

        };


    // =====================================================
    // EDIT BANNER
    // =====================================================

    const handleBannerEdit =
        (banner) => {

            setEditingBannerId(
                banner.id
            );

            setBannerForm({

                image:
                    banner.image || "",

                title:
                    banner.title || "",

                description:
                    banner.description || ""

            });

            setBannerFile(null);

            setBannerPreview(
                banner.image || ""
            );


            // =================================================
            // SCROLL TO BANNER MANAGEMENT
            // =================================================

            setTimeout(() => {

                bannerManagementRef.current?.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }, 100);

        };


    // =====================================================
    // DELETE BANNER
    // =====================================================

    const handleBannerDelete =
        async (id) => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this banner?"
                );

            if (!confirmed) {

                return;

            }

            try {

                await deleteBanner(id);

                setBanners(previous =>
                    previous.filter(
                        banner =>
                            banner.id !== id
                    )
                );


                if (
                    String(editingBannerId) ===
                    String(id)
                ) {

                    resetBannerForm();

                }

                alert(
                    "Banner deleted successfully"
                );

            } catch (error) {

                console.error(
                    "Delete banner error:",
                    error
                );

                alert(
                    "Failed to delete banner"
                );

            }

        };


    // =====================================================
    // RESET BANNER FORM
    // =====================================================

    const resetBannerForm = () => {

        setEditingBannerId(null);

        setBannerFile(null);

        setBannerPreview("");

        setBannerForm({

            image: "",

            title: "",

            description: ""

        });


        const input =
            document.getElementById(
                "banner-image"
            );

        if (input) {

            input.value = "";

        }

    };


    // =====================================================
    // RETURN
    // =====================================================

    return (

        <div className="admin-page">


            {/* =================================================
                PAGE TITLE
            ================================================= */}

            <h1>
                Admin Panel
            </h1>


            {/* =================================================
                BANNER MANAGEMENT
            ================================================= */}

            <section
                className="admin-banner-section"
                ref={bannerManagementRef}
            >

                <h2>
                    Hero Banner Management
                </h2>


                {/* =================================================
                    BANNER FORM
                ================================================= */}

                <form
                    className="admin-banner-form"
                    onSubmit={
                        handleBannerSubmit
                    }
                >

                    <h3>

                        {editingBannerId
                            ? "Edit Hero Banner"
                            : "Add Hero Banner"}

                    </h3>


                    {/* IMAGE */}

                    <label htmlFor="banner-image">

                        Banner Image

                    </label>


                    <input
                        id="banner-image"
                        type="file"
                        accept="image/*"
                        onChange={
                            handleBannerImageChange
                        }
                    />


                    {/* PREVIEW */}

                    {bannerPreview && (

                        <div className="admin-banner-preview">

                            <img
                                src={bannerPreview}
                                alt="Banner Preview"
                            />

                        </div>

                    )}


                    {/* TITLE */}

                    <label>

                        Banner Title

                    </label>

                    <input
                        type="text"
                        name="title"
                        placeholder="Banner Title"
                        value={
                            bannerForm.title
                        }
                        onChange={
                            handleBannerChange
                        }
                    />


                    {/* DESCRIPTION */}

                    <label>

                        Banner Description

                    </label>

                    <textarea
                        name="description"
                        placeholder="Banner Description"
                        value={
                            bannerForm.description
                        }
                        onChange={
                            handleBannerChange
                        }
                    />


                    {/* SAVE */}

                    <button
                        type="submit"
                        disabled={
                            bannerLoading
                        }
                    >

                        {bannerLoading

                            ? "Saving..."

                            : editingBannerId

                                ? "Update Banner"

                                : "Add Banner"}

                    </button>


                    {/* CANCEL */}

                    {editingBannerId && (

                        <button
                            type="button"
                            onClick={
                                resetBannerForm
                            }
                        >

                            Cancel

                        </button>

                    )}

                </form>


                {/* =================================================
                    BANNER LIST
                ================================================= */}

                <div className="admin-banner-list">

                    <h3>

                        Existing Banners (
                        {banners.length}
                        )

                    </h3>


                    {loadingBanners && (

                        <p>

                            Loading banners...

                        </p>

                    )}


                    {!loadingBanners &&
                        banners.length === 0 && (

                            <p>

                                No banners found.

                            </p>

                        )}


                    {!loadingBanners &&
                        banners.length > 0 && (

                            <div className="admin-banner-grid">

                                {banners.map(
                                    banner => (

                                        <div
                                            className="admin-banner-card"
                                            key={
                                                banner.id
                                            }
                                        >

                                            <img
                                                src={
                                                    banner.image ||
                                                    "/placeholder.png"
                                                }
                                                alt={
                                                    banner.title ||
                                                    "Banner"
                                                }
                                            />


                                            <h3>

                                                {
                                                    banner.title
                                                }

                                            </h3>


                                            <p>

                                                {
                                                    banner.description
                                                }

                                            </p>


                                            <div className="admin-banner-actions">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleBannerEdit(
                                                            banner
                                                        )
                                                    }
                                                    title="Edit Banner"
                                                >

                                                    <i className="bi bi-pencil"></i>

                                                    Edit

                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleBannerDelete(
                                                            banner.id
                                                        )
                                                    }
                                                    title="Delete Banner"
                                                >

                                                    <i className="bi bi-trash"></i>

                                                    Delete

                                                </button>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                </div>

            </section>


            {/* =================================================
                PRODUCT MANAGEMENT
            ================================================= */}

            <section
                className="admin-product-section"
                ref={
                    productManagementRef
                }
            >

                <h2>

                    Product Management

                </h2>


                {/* =================================================
                    PRODUCT FORM
                ================================================= */}

                <form
                    className="admin-product-form"
                    onSubmit={
                        handleSubmit
                    }
                >

                    <h2>

                        {editingId
                            ? "Edit Product"
                            : "Add Product"}

                    </h2>


                    {/* NAME */}

                    <label>

                        Product Name

                    </label>

                    <input
                        type="text"
                        name="name"
                        placeholder="Product Name"
                        value={
                            form.name
                        }
                        onChange={
                            handleChange
                        }
                        required
                    />


                    {/* CATEGORY */}

                    <label>

                        Category

                    </label>

                    <input
                        type="text"
                        name="category"
                        placeholder="Category"
                        value={
                            form.category
                        }
                        onChange={
                            handleChange
                        }
                        required
                    />


                    {/* SUBCATEGORY */}

                    <label>

                        Subcategory

                    </label>

                    <input
                        type="text"
                        name="subcategory"
                        placeholder="Subcategory"
                        value={
                            form.subcategory
                        }
                        onChange={
                            handleChange
                        }
                        required
                    />


                    {/* ORIGINAL PRICE */}

                    <label>

                        Original Price

                    </label>

                    <input
                        type="number"
                        name="price"
                        placeholder="Original Price"
                        value={
                            form.price
                        }
                        onChange={
                            handleChange
                        }
                        min="0"
                        required
                    />


                    {/* OFFER PRICE */}

                    <label>

                        Offer Price

                    </label>

                    <input
                        type="number"
                        name="offerprice"
                        placeholder="Offer Price"
                        value={
                            form.offerprice
                        }
                        onChange={
                            handleChange
                        }
                        min="0"
                        required
                    />


                    {/* PRODUCT IMAGES */}

                    <label htmlFor="product-images">

                        Product Images

                    </label>


                    <input
                        id="product-images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={
                            handleImageChange
                        }
                    />


                    {/* =================================================
                        NEW IMAGE PREVIEWS
                    ================================================= */}

                    {imageFiles.length > 0 && (

                        <div className="admin-image-preview-container">

                            {imageFiles.map(
                                (
                                    file,
                                    index
                                ) => (

                                    <div
                                        className="admin-image-preview"
                                        key={
                                            `${file.name}-${index}`
                                        }
                                    >

                                        <img
                                            src={
                                                imagePreview[
                                                    index
                                                ]
                                            }
                                            alt="Preview"
                                        />


                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeSelectedImage(
                                                    index
                                                )
                                            }
                                            title="Remove image"
                                        >

                                            ×

                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    )}


                    {/* =================================================
                        EXISTING IMAGE PREVIEWS
                    ================================================= */}

                    {editingId &&
                        imageFiles.length === 0 &&
                        imagePreview.length > 0 && (

                            <div className="admin-image-preview-container">

                                {imagePreview.map(
                                    (
                                        image,
                                        index
                                    ) => (

                                        <div
                                            className="admin-image-preview"
                                            key={
                                                index
                                            }
                                        >

                                            <img
                                                src={
                                                    image
                                                }
                                                alt={
                                                    `Existing ${
                                                        index + 1
                                                    }`
                                                }
                                            />

                                        </div>

                                    )
                                )}

                            </div>

                        )}


                    {/* DESCRIPTION */}

                    <label>

                        Product Description

                    </label>

                    <textarea
                        name="description"
                        placeholder="Product Description"
                        value={
                            form.description
                        }
                        onChange={
                            handleChange
                        }
                    />


                    {/* SAVE */}

                    <button
                        type="submit"
                        disabled={
                            loading
                        }
                    >

                        {loading

                            ? "Uploading..."

                            : editingId

                                ? "Update Product"

                                : "Add Product"}

                    </button>


                    {/* CANCEL */}

                    {editingId && (

                        <button
                            type="button"
                            onClick={
                                resetForm
                            }
                        >

                            Cancel

                        </button>

                    )}

                </form>


                {/* =================================================
                    PRODUCT LIST
                ================================================= */}

                <div className="admin-products">

                    <h2>

                        Products (
                        {products.length}
                        )

                    </h2>


                    {/* LOADING */}

                    {loadingProducts && (

                        <p className="products-loading">

                            Loading products...

                        </p>

                    )}


                    {/* EMPTY */}

                    {!loadingProducts &&
                        products.length === 0 && (

                            <p className="no-products">

                                No products found.

                            </p>

                        )}


                    {/* PRODUCTS */}

                    {!loadingProducts &&
                        products.length > 0 && (

                            <div className="admin-product-grid">

                                {products.map(
                                    product => (

                                        <div
                                            className="admin-product-card"
                                            key={
                                                product.id
                                            }
                                        >

                                            {/* PRODUCT IMAGE */}

                                            <img
                                                src={
                                                    getFirstImage(
                                                        product.image
                                                    )
                                                }
                                                alt={
                                                    product.name ||
                                                    "Product"
                                                }
                                            />


                                            {/* TOP ACTIONS */}

                                            <div className="admin-actions">

                                                {/* EDIT */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(
                                                            product
                                                        )
                                                    }
                                                    title="Edit Product"
                                                    aria-label="Edit Product"
                                                >

                                                    <i className="bi bi-pencil"></i>

                                                </button>


                                                {/* DELETE */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            product.id
                                                        )
                                                    }
                                                    title="Delete Product"
                                                    aria-label="Delete Product"
                                                >

                                                    <i className="bi bi-trash"></i>

                                                </button>

                                            </div>


                                            {/* PRODUCT NAME */}

                                            <h3>

                                                {
                                                    product.name
                                                }

                                            </h3>


                                            {/* CATEGORY */}

                                            <p>

                                                <strong>
                                                    Category:
                                                </strong>{" "}

                                                {
                                                    product.category
                                                }

                                            </p>


                                            {/* SUBCATEGORY */}

                                            <p>

                                                <strong>
                                                    Subcategory:
                                                </strong>{" "}

                                                {
                                                    product.subcategory
                                                }

                                            </p>


                                            {/* PRICE */}

                                            <div className="admin-product-price">

                                                ₹
                                                {
                                                    product.offerprice
                                                }

                                                {" "}

                                                <del>

                                                    ₹
                                                    {
                                                        product.price
                                                    }

                                                </del>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                </div>

            </section>

        </div>

    );

}