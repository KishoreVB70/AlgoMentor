import React, {useState, useEffect} from "react";
import {toast} from "react-toastify";
import AddMentor from "./AddMentor";
import Loader from "../utils/Loader";
import {NotificationError, NotificationSuccess} from "../utils/Notifications";
import {buyMentorAction, createMentorAction, deleteMentorAction, getMentorAction,} from "../../utils/marketplace";
import PropTypes from "prop-types";
import Mentor from "./Mentor";
import NewMentor from "./NewMentor";

const ScrollMentor = ({address, fetchBalance}) => {
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
                toast(<NotificationError text="Failed to create a mentor."/>);
                setLoading(false);
            })
    };

    const buyMentor = async (product, count) => {
	    setLoading(true);
        console.log(product);
	    buyMentorAction(address, product, count)
	        .then(() => {
	            toast(<NotificationSuccess text="Product bought successfully"/>);
	            getMentors();
	            fetchBalance(address);
	        })
	        .catch(error => {
	            console.log(error)
	            toast(<NotificationError text="Failed to purchase product."/>);
	            setLoading(false);
	        })
	};

    const deleteMentor = async (mentor) => {
        setLoading(true);
        deleteMentorAction(address, mentor.appId)
            .then(() => {
                toast(<NotificationSuccess text="Mentor deleted successfully"/>);
                getMentors();
                fetchBalance(address);
            })
            .catch(error => {
                console.log(error)
                toast(<NotificationError text="Failed to delete mentor."/>);
                setLoading(false);
            })
    };

	if (loading) {
	    return <Loader/>;
	}
	return (
	    <>
	        <div>
	            <AddMentor createMentor={createMentor}/>
	        </div>
	        <div className="mentors">
	            <>
	                {mentors.map((mentor, index) => (
	                    <NewMentor
	                        address={address}
	                        mentor={mentor}
	                        buyMentor={buyMentor}
	                        deleteMentor={deleteMentor}
	                        key={index}
	                    />
	                ))}
	            </>
	        </div>
	    </>
	);
};

ScrollMentor.propTypes = {
    address: PropTypes.string.isRequired,
    fetchBalance: PropTypes.func.isRequired
};

export default ScrollMentor;
