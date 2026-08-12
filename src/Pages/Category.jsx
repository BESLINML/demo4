import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Allproducts from "../Products/Allproducts";

export default function Category() {

    const navigate = useNavigate();

    const [activeCategory, setActiveCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);

    const categoryRef = useRef(null);


    const manualSubCategories = {
        "Main Categories": [
            "Customized Gifts",
            "Readymade Gifts",
            "Premium Gifts",
            "Budget Gifts"
        ],

        "Occasion-Based Categories": [
            "Birthday Gifts",
            "Wedding & Anniversary Gifts",
            "Festival Gifts",
            "Love & Romantic Gifts",
            "Friendship Gifts"
        ],

        "Recipient-Based Categories": [
            "Gifts for Him",
            "Gifts for Her",
            "Gifts for Kids",
            "Gifts for Parents",
            "Gifts for Friends"
        ],

        "Product-Based Categories": [
            "Photo Frames",
            "Wall Hangings",
            "MDF Gifts",
            "Metal Engraving",
            "Pillow Printing",
            "Cup Printing",
            "Keychains",
            "Return Gifts",
            "3D Printing",
            "Laser Cutting",
            "Home Decor",
            "Toys",
        ],

        "Special Categories": [
            "Corporate Gifts",
            "Bulk Orders",
            "Handmade Gifts",
            "Trending Gifts"
        ],

        "Premium Sections": [
            "Best Sellers",
            "New Arrivals",
            "Limited Edition",
            "Personalized Combos"
        ]
    };


    const productCategories = [
        ...new Set(
            Allproducts.map(product => product.category)
        )
    ];


    const categories = [
        ...new Set([
            ...productCategories,
            ...Object.keys(manualSubCategories)
        ])
    ];



    const productSubcategories = activeCategory
        ? Allproducts
            .filter(
                product =>
                    product.category === activeCategory
            )
            .map(product => product.subcategory)
            .filter(Boolean)
        : [];



    const subcategories = activeCategory
        ? [
            ...new Set([
                ...productSubcategories,
                ...(manualSubCategories[activeCategory] || [])
            ])
        ]
        : [];



    const handleCategoryClick = (category)=>{

        if(activeCategory === category){

            setActiveCategory(null);
            setSelectedSubcategory(null);

        }else{

            setActiveCategory(category);
            setSelectedSubcategory(null);

        }

    };



    const handleSubcategoryClick = (subcategory)=>{

        setSelectedSubcategory(subcategory);


        navigate(
            `/category/${encodeURIComponent(subcategory)}`
        );


    };



    useEffect(()=>{


        const handleClickOutside=(event)=>{


            if(
                categoryRef.current &&
                !categoryRef.current.contains(event.target)
            ){

                setActiveCategory(null);
                setSelectedSubcategory(null);

            }


        };


        document.addEventListener(
            "mousedown",
            handleClickOutside
        );


        return ()=>{

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };


    },[]);



    return (

        <div 
            className="category-container"
            ref={categoryRef}
        >


            <div className="category-row">


                {categories.map(category=>(

                    <button

                        key={category}

                        className={
                            activeCategory === category
                            ?
                            "category active"
                            :
                            "category"
                        }


                        onClick={()=>
                            handleCategoryClick(category)
                        }

                    >

                        {category}


                        {
                            (
                                manualSubCategories[category] ||

                                Allproducts.some(
                                    product =>
                                    product.category === category &&
                                    product.subcategory
                                )

                            )
                            &&
                            <i className="bi bi-chevron-down"></i>
                        }


                    </button>

                ))}


            </div>



            {
                activeCategory &&
                subcategories.length > 0 &&

                (

                <div className="subcategory-row">


                    {
                    subcategories.map(subcategory=>(


                        <button

                            key={subcategory}


                            className={
                                selectedSubcategory === subcategory
                                ?
                                "subcategory active"
                                :
                                "subcategory"
                            }


                            onClick={()=>
                                handleSubcategoryClick(subcategory)
                            }

                        >

                            {subcategory}

                        </button>


                    ))
                    }


                </div>

                )

            }



        </div>

    );

}