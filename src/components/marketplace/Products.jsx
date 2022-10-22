import React, {useState} from "react";
import {toast} from "react-toastify";
import AddMentor from "./AddMentor";
import Loader from "../utils/Loader";
import {NotificationError, NotificationSuccess} from "../utils/Notifications";
import {createMentor} from "../../utils/marketplace";

const Products = ({address, fetchBalance}) => {
    const [loading, setLoading] = useState(false);

    const createProduct = async (data) => {
        setLoading(true);
        createMentor(address, data)
            .then(() => {
                toast(<NotificationSuccess text="Product added successfully."/>);
                // getProducts();
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
