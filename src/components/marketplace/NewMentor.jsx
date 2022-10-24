import React, {useState} from "react";
import PropTypes from "prop-types";
import {Button} from "react-bootstrap";
import Dropdown from 'react-bootstrap/Dropdown';
import {microAlgosToString, stringToMicroAlgos,  truncateAddress} from "../../utils/conversions";

const NewMentor = ({address, mentor, buyMentor, deleteMentor, rateMentor, changePrice, supportMentor, optInToApp}) => {
    const {expertise, description, price, avgrating, numofraters,buyers, amountdonated, owner} =
        mentor;

    let intAmount;
    if(amountdonated > 0){
        intAmount = parseInt(microAlgosToString(amountdonated));
    }else{
        intAmount = amountdonated;
    }
    
    const [hours, setHours] = useState("")
    const [currentChangePrice, setChangePrice] = useState("")
    const [supportAmount, setSupportAmount] = useState("")

    return (
        <div className="indvmentor">
            <div className="topdiv">
                <span className="font-monospace text-secondary">{truncateAddress(owner)}</span>
                <p>Price: {microAlgosToString(price) * 1} Algo</p>
            </div>
            <div className="flexguys">
                <h2>{expertise}</h2>
                <p>{description}</p>
                <div className="details">
                    <p>Bought: {buyers}</p>
                    <p>Rating: {avgrating}/5</p>
                    <p>Raters: {numofraters}</p>
                </div>
                    <p>Amount Donated: {intAmount} Algo</p>
                {mentor.owner === address && 
                    <>   
                        <div className="input">
                            <input placeholder="new price" type="number" value={currentChangePrice} onChange = { (e) => setChangePrice(e.target.value) } />
                            <button className='newbtn' onClick = {() => changePrice(mentor, currentChangePrice)}> Change Price </button>
                        </div>
                        <Button
                                    variant="outline-danger"
                                    onClick={() => deleteMentor(mentor)}
                                    className="btn"
                                    >
                                    Delete
                                </Button>

                    </>
                }
                {mentor.owner !== address &&
                    <>
                        {mentor.hasopt === 0 && 
                            <>
                                <button onClick={() => optInToApp(mentor)} >Opt in to buy</button>
                            </>
                        }
                        {mentor.hasopt === 1 && 
                            <>
                                <div className="input">
                                    <input placeholder="Hours" type="number" value={hours} onChange = { (e) => setHours(e.target.value) } />
                                    <button className='newbtn' onClick = {() => buyMentor(mentor, hours)}> Buy for {microAlgosToString(price) * hours} Algo</button>
                                </div>
                            </>
                        }
                        <div className="input">
                            <input placeholder="Amount" type="number" value={supportAmount} onChange = { (e) => setSupportAmount(e.target.value) } />
                            <button className='newbtn' onClick = {() => supportMentor(mentor, stringToMicroAlgos(supportAmount))}> Support Mentor</button>
                        </div>
                        {mentor.hasbought === 0 && 
                        <>
                            <button className="ratebtn">Buy to rate</button>
                        </>
                        }
                        {mentor.hasrated === 1 &&
                        <>
                            <button className="ratebtn" >Already Rated</button>
                        </>
                        }
                        {mentor.hasbought === 1 && mentor.hasrated === 0 &&
                        <>
                            <Dropdown>
                                <Dropdown.Toggle variant="success" id="dropdown-basic">
                                    Rate Mentor
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => rateMentor(mentor,1)}>1</Dropdown.Item>
                                    <Dropdown.Item onClick={() => rateMentor(mentor,2)}>2</Dropdown.Item>
                                    <Dropdown.Item onClick={() => rateMentor(mentor,3)}>3</Dropdown.Item>
                                    <Dropdown.Item onClick={() => rateMentor(mentor,4)}>4</Dropdown.Item>
                                    <Dropdown.Item onClick={() => rateMentor(mentor,5)}>5</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>   
                        </>
                        }
                    </>
                }
            </div>
        </div>
    );
};

NewMentor.propTypes = {
    address: PropTypes.string.isRequired,
    mentor: PropTypes.instanceOf(Object).isRequired,
    buyMentor: PropTypes.func.isRequired,
    deleteMentor: PropTypes.func.isRequired
};

export default NewMentor