import React, {useState, useEffect} from "react";
import {toast} from "react-toastify";
import AddMentor from "./AddMentor";
import Loader from "../utils/Loader";
import {NotificationError, NotificationSuccess} from "../utils/Notifications";
import {createMentorAction, getMentorAction,} from "../../utils/marketplace";
import PropTypes from "prop-types";
import {Row} from "react-bootstrap";

const Products = ({address, fetchBalance}) => {
    const [loading, setLoading] = useState(false);
    const [mentors, setMentors] = useState([]);
    

    const getMentors = async () => {
        setLoading(true);
        getMentorAction()
            .then(mentors => {
                if (mentors) {
                    setMentors(mentors);
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
            getMentors();
        }, []);
        

    const createMentor = async (data) => {
        setLoading(true);
        console.log(data)
        createMentorAction(address, data)
            .then(() => {
                toast(<NotificationSuccess text="Mentor added successfully."/>);
                getMentors();
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
	            <AddMentor createMentor={createMentor}/>
	        </div>
	    </>
	);
};


export default Products;
