import React, {useState, useEffect} from "react";
import {toast} from "react-toastify";
import AddMentor from "./AddMentor";
import Loader from "../utils/Loader";
import {NotificationError, NotificationSuccess} from "../utils/Notifications";
import {createMentor, getProductsAction,} from "../../utils/marketplace";
import PropTypes from "prop-types";
import {Row} from "react-bootstrap";

const Products = ({address, fetchBalance}) => {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    

    const getProducts = async () => {
        setLoading(true);
        getProductsAction()
            .then(products => {
                if (products) {
                    setProducts(products);
                }
            })
            .catch(error => {
                console.log(error);
            })
            .finally(_ => {
                setLoading(false);
            });
        };
        
        useEffect(() => {
            getProducts();
        }, []);
        

    const createProduct = async (data) => {
        setLoading(true);
        createMentor(address, data)
            .then(() => {
                toast(<NotificationSuccess text="Product added successfully."/>);
                getProducts();
                fetchBalance(address);
            })
            .catch(error => {
                console.log(error);
                toast(<NotificationError text="Failed to create a product."/>);
                setLoading(false);
            })
    };

    if (loading) {
	    return <Loader/>;
	}
	return (
	    <>
	        <div className="d-flex justify-content-between align-items-center mb-4">
	            <h1 className="fs-4 fw-bold mb-0">Algo Mentorship</h1>
	            <AddMentor createProduct={createProduct}/>
	        </div>
	    </>
	);
};


export default Products;
