import React, {useState, useEffect} from "react";
import {toast} from "react-toastify";
import AddMentor from "./AddMentor";
import Loader from "../utils/Loader";
import {NotificationError, NotificationSuccess} from "../utils/Notifications";
import {
			buyMentorAction, createMentorAction, 
			deleteMentorAction, getMentorAction, 
			rateMentorAction, changePriceAction, 
			supportMentorAction, optInAction
		} from "../../utils/mentor";

import PropTypes from "prop-types";
import NewMentor from "./Mentor";

const Mentors = ({address, fetchBalance}) => {
    const [loading, setLoading] = useState(false);
    const [mentors, setMentors] = useState([]);
    

    const getMentors = async () => {
        setLoading(true);
		toast(<NotificationSuccess text="Fetching mentors"/>);
        getMentorAction(address)
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
				toast(<NotificationSuccess text="Fetched mentors successfully"/>);

            });
        };
        
        useEffect(() => {
            getMentors();
        }, []);
        

    const createMentor = async (data) => {
        setLoading(true);
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

    const buyMentor = async (mentor, count) => {
		setLoading(true);
		 buyMentorAction(address, mentor, count)
		.then(() => {
			toast(<NotificationSuccess text="Mentor bought successfully"/>);
			getMentors();
			fetchBalance(address);
		})
		.catch(error => {
			console.log(error)
			toast(<NotificationError text="Failed to purchase mentor."/>);
			setLoading(false);
		})
	};

    const optInToApp = async (mentor) => {
		setLoading(true);
		optInAction(address, mentor.appId)
		.then(() => {
			toast(<NotificationSuccess text="Opted in successfully"/>);
			getMentors();
			fetchBalance(address);
		})
		.catch(error => {
			console.log(error)
			toast(<NotificationError text="Failed to Opt into the application"/>);
			setLoading(false);
		})
	};

    const supportMentor = async (mentor, amount) => {
	    setLoading(true);
	    supportMentorAction(address, mentor, amount)
	        .then(() => {
	            toast(<NotificationSuccess text="Mentor Supported successfully"/>);
	            getMentors();
	            fetchBalance(address);
	        })
	        .catch(error => {
	            console.log(error)
	            toast(<NotificationError text="Failed to Support mentor."/>);
	            setLoading(false);
	        })
	};

    const rateMentor = async (mentor, rating) => {
	    setLoading(true);
	    rateMentorAction(address, mentor, rating)
	        .then(() => {
	            toast(<NotificationSuccess text="Mentor Rated successfully"/>);
	            getMentors();
	            fetchBalance(address);
	        })
	        .catch(error => {
	            console.log(error)
	            toast(<NotificationError text="Failed to Rate mentor."/>);
	            setLoading(false);
	        })
	};

    const changePrice = async (mentor, newPrice) => {
	    setLoading(true);
	    changePriceAction(address, mentor, newPrice)
	        .then(() => {
	            toast(<NotificationSuccess text="Changed price"/>);
	            getMentors();
	            fetchBalance(address);
	        })
	        .catch(error => {
	            console.log(error)
	            toast(<NotificationError text="Failed to Change price."/>);
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
                            rateMentor={rateMentor}
                            changePrice={changePrice}
                            supportMentor={supportMentor}
							optInToApp={optInToApp}
	                        key={index}
	                    />
	                ))}
	            </>
	        </div>
	    </>
	);
};

Mentors.propTypes = {
    address: PropTypes.string.isRequired,
    fetchBalance: PropTypes.func.isRequired
};

export default Mentors;
