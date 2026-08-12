import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CategoryProducts({
    subcategory,
    products
}) {

    const navigate = useNavigate();


    const [randomProducts] = useState(() => {

        return [...products]
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);

    });


    return (
        <section className="home-category-section">

            <div className="home-category-header">

                <h2>
                    {subcategory}
                </h2>

                <button
                    onClick={() =>
                        navigate(
                            `/category/${encodeURIComponent(
                                subcategory
                            )}`
                        )
                    }
                >
                    View All
                </button>

            </div>


            <div className="home-product-row">

                {randomProducts.map(product => (

                    <ProductCard
                        key={product.id}
                        product={product}

                        onClick={() =>
                            navigate(
                                `/product/${product.id}`
                            )
                        }
                    />

                ))}

            </div>

        </section>
    );
}

export function ProductCard({
    product,
    onClick
}) {

    const [imageIndex, setImageIndex] = useState(0);

    const [isHovered, setIsHovered] =
        useState(false);


    useEffect(() => {

        if (
            !isHovered ||
            !product.image ||
            product.image.length <= 1
        ) {
            return;
        }

        const interval = setInterval(() => {

            setImageIndex(previous =>
                (previous + 1) %
                product.image.length
            );

        }, 1000);

        return () => {
            clearInterval(interval);
        };

    }, [isHovered, product.image]);


    const discount =
        product.offerprice && product.price
            ? Math.round(
                ((product.price - product.offerprice) /
                    product.price) * 100
            )
            : 0;


    return (

        <div
            className="home-product-card"

            onClick={onClick}

            onMouseEnter={() =>
                setIsHovered(true)
            }

            onMouseLeave={() => {
                setIsHovered(false);
                setImageIndex(0);
            }}
        >

            <div className="home-product-image">

                <img
                    src={product.image[imageIndex]}
                    alt={product.name}
                />

            </div>


            <div className="home-product-info">

                <h3>
                    {product.name}
                </h3>


                <div className="product-price">

                    <span className="offer-price">
                        ₹{product.offerprice}
                    </span>

                     <span className="original-price">
                        ₹{product.price}
                    </span>

                    {discount > 0 && (
                        <span className="discount">
                            {discount}% OFF
                        </span>
                    )}

                </div>

            </div>

        </div>
    );
}