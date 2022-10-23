import React, {useState} from "react";
import PropTypes from "prop-types";
import {Badge, Button, FloatingLabel, Form, Stack} from "react-bootstrap";
import Dropdown from 'react-bootstrap/Dropdown';
import {microAlgosToString, truncateAddress} from "../../utils/conversions";
import Identicon from "../utils/Identicon";

const NewMentor = ({address, mentor, buyMentor, deleteMentor, rateMentor}) => {
    const {expertise, description, price, avgrating, numofraters, totalrating, buyers, amountdonated, appId, owner} =
        mentor;

    const [hours, setHours] = useState("")
    const [changePrice, setChangePrice] = useState("")
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
                    <p>Raters: {numofraters}</p>
                    <p>Rating: {avgrating}</p>
                    <p>Donated: {amountdonated}</p>
                </div>
                {mentor.owner === address && 
                    <>   
                        <div className="edit">
                            <input placeholder="new price" type="number" value={changePrice} onChange = { (e) => setChangePrice(e.target.value) } />
                            <button className='newbtn' onClick = {() => changePrice(mentor, price)}> Change Price </button>
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
                        <div className="buy">
                            <input placeholder="Hours" type="number" value={hours} onChange = { (e) => setHours(e.target.value) } />
                            <button className='newbtn' onClick = {() => buyMentor(mentor, hours)}> Buy for {microAlgosToString(price) * hours} Algo</button>
                        </div>
                        <div>
                            <input placeholder="Amount" type="number" value={hours} onChange = { (e) => setHours(e.target.value) } />
                            <button className='newbtn' onClick = {() => buyMentor(mentor, hours)}> Buy for {microAlgosToString(price) * hours} Algo</button>
                        </div>
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