import React, {useCallback, useState} from "react";
import PropTypes from "prop-types";
import {Button, FloatingLabel, Form, Modal} from "react-bootstrap";
import {stringToMicroAlgos} from "../../utils/conversions";

const AddMentor = ({createProduct}) => {
    const [expertise, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);

    const isFormFilled = useCallback(() => {
        return expertise && description && price > 0
    }, [expertise, description, price]);

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Button
                onClick={handleShow}
                variant="dark"
                className="rounded-pill px-0"
                style={{width: "150px"}}
            >
                <p>Add Mentor</p>
            </Button>
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>New Product</Modal.Title>
                </Modal.Header>
                <Form>
                    <Modal.Body>
                        <FloatingLabel
                            controlId="inputName"
                            label="Your expertise"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                onChange={(e) => {
                                    setName(e.target.value);
                                }}
                                placeholder="Enter Your expertise"
                            />
                        </FloatingLabel>
                        <FloatingLabel
                            controlId="inputDescription"
                            label="Description"
                            className="mb-3"
                        >
                            <Form.Control
                                as="textarea"
                                placeholder="description"
                                style={{ height: "80px" }}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                }}
                            />
                        </FloatingLabel>
                        <FloatingLabel
                            controlId="inputPrice"
                            label="per hour price ALGO"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                placeholder="Price"
                                onChange={(e) => {
                                    setPrice(stringToMicroAlgos(e.target.value));
                                }}
                            />
                        </FloatingLabel>
                    </Modal.Body>
                </Form>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button
                        variant="dark"
                        disabled={!isFormFilled()}
                        onClick={() => {
                            createProduct({
                                expertise,
                                description,
                                price
                            });
                            handleClose();
                        }}
                    >
                        Save product
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

AddMentor.propTypes = {
    createProduct: PropTypes.func.isRequired,
};

export default AddMentor;