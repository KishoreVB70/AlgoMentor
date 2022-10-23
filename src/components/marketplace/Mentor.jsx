import React, {useState} from "react";
import PropTypes from "prop-types";
import {Badge, Button, Card, Col, FloatingLabel, Form, Stack} from "react-bootstrap";
import Dropdown from 'react-bootstrap/Dropdown';
import {microAlgosToString, truncateAddress} from "../../utils/conversions";
import Identicon from "../utils/Identicon";

const Mentor = ({address, mentor, buyMentor, deleteMentor}) => {
    const {expertise, description, image, price, avgrating, numofraters, totalrating, buyers, amountdonated, appId, owner} =
        mentor;

    const [hours, setHours] = useState(1)
    const [changePrice, setChangePrice] = useState(1)

    return (
        <Col key={appId}>
            <Card className="h-100">
                <Card.Header>
                    <Stack direction="horizontal" gap={2}>
                        <span className="font-monospace text-secondary">{truncateAddress(owner)}</span>
                        <Identicon size={28} address={owner}/>
                        <Badge bg="secondary" className="ms-auto">
                            {buyers} Bought
                        </Badge>
                    </Stack>
                </Card.Header>
                <div className="ratio ratio-4x3">
                    <img src={image} alt={expertise} style={{objectFit: "cover"}}/>
                </div>
                <Card.Body className="d-flex flex-column text-center">
                    <Card.Title>{expertise}</Card.Title>
                    <Card.Text className="flex-grow-1">{description}</Card.Text>
                    <Form className="d-flex align-content-stretch flex-row gap-2">
                        {mentor.owner !== address &&
                            <>
                                <Dropdown>
                                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                                        Rate
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item >1</Dropdown.Item>
                                        <Dropdown.Item >2</Dropdown.Item>
                                        <Dropdown.Item >3</Dropdown.Item>
                                        <Dropdown.Item >4</Dropdown.Item>
                                        <Dropdown.Item >5</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                                <FloatingLabel
                                    controlId="inputhours"
                                    label="hours"
                                    className="w-25"
                                >
                                    <Form.Control
                                        type="number"
                                        value={hours}
                                        min="1"
                                        max="10"
                                        onChange={(e) => {
                                            setHours(Number(e.target.value));
                                        }}
                                    />
                                </FloatingLabel>
                                <Button
                                    variant="outline-dark"
                                    onClick={() => buyMentor(mentor, hours)}
                                    className="w-75 py-3"
                                    >
                                    Buy for {microAlgosToString(price) * hours} ALGO
                                </Button>
                            </>
                        }
                        {mentor.owner === address &&
                            <>
                                <Button
                                    variant="outline-danger"
                                    onClick={() => deleteMentor(mentor)}
                                    className="btn"
                                    >
                                    <i className="bi bi-trash"></i>
                                </Button>

                                <FloatingLabel
                                    controlId="inputprice"
                                    label="Price"
                                    className="w-25"
                                    >
                                    <Form.Control
                                        type="number"
                                        value={changePrice}
                                        min="1"
                                        max="20"
                                        onChange={(e) => {
                                            setChangePrice(Number(e.target.value));
                                        }}
                                    />
                                </FloatingLabel>
                                <Button
                                    variant="outline-dark"
                                    onClick={() => console.log("clicked")}
                                    className="w-75 py-3"
                                    >
                                    Change price to {changePrice} Algo
                                </Button>
                            </>
                        }
                    </Form>
                </Card.Body>
            </Card>
        </Col>
    );
};

Mentor.propTypes = {
    address: PropTypes.string.isRequired,
    mentor: PropTypes.instanceOf(Object).isRequired,
    buyMentor: PropTypes.func.isRequired,
    deleteMentor: PropTypes.func.isRequired
};

export default Mentor;