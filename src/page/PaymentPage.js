import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import OrderReceipt from "../component/OrderReceipt";
import PaymentForm from "../component/PaymentForm";
import "../style/paymentPage.style.css";
import { useSelector, useDispatch } from "react-redux";
import { orderActions } from "../action/orderAction";
import { useNavigate } from "react-router";
import { cc_expires_format } from "../utils/number";

const PaymentPage = () => {
  const dispatch = useDispatch();
  const { cartList, totalPrice } = useSelector((state) => state.cart);
  const { couponList } = useSelector((state) => state.event);
  const [cardValue, setCardValue] = useState({
    cvc: "",
    expiry: "",
    focus: "",
    name: "",
    number: "",
  });
  const navigate = useNavigate();
  const [couponCheck, setCouponCheck] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState("");
  const [dcPrice, setDcPrice] = useState(totalPrice);
  const [shipInfo, setShipInfo] = useState({
    firstName: "",
    lastName: "",
    contact: "",
    address: "",
    city: "",
    zip: "",
  });

  const redeemCoupon = (event) => {
    const coupon = couponList.find((c) => c._id === event.target.id);
    setCouponCheck(event.target.checked);
    if (event.target.checked) {
      setDcPrice(totalPrice * (1 - coupon.discountRate / 100));
      setSelectedCoupon(coupon);
    } else {
      setDcPrice(totalPrice);
      setSelectedCoupon("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const { firstName, lastName, contact, address, city, zip } = shipInfo;
    const data = {
      totalPrice: dcPrice,
      shipTo: { address, city, zip },
      contact: { firstName, lastName, contact },
      items: cartList.map((item) =>
        couponCheck
          ? {
              productId: item.productId._id,
              price:
                item.productId.price * (1 - selectedCoupon.discountRate / 100),
              qty: item.qty,
              size: item.size.toLowerCase(),
            }
          : {
              productId: item.productId._id,
              price: item.productId.price,
              qty: item.qty,
              size: item.size.toLowerCase(),
            }
      ),
      couponId: selectedCoupon._id,
    };
    dispatch(orderActions.createOrder(data, navigate));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setShipInfo({ ...shipInfo, [name]: value });
  };

  const handlePaymentInfoChange = (event) => {
    const { name, value } = event.target;
    if (name === "expiry") {
      return setCardValue({ ...cardValue, [name]: cc_expires_format(value) });
    } else {
      setCardValue({ ...cardValue, [name]: value });
    }
  };

  const handleInputFocus = (e) => {
    setCardValue({ ...cardValue, focus: e.target.name });
  };

  if (cartList.length === 0) {
    navigate("/cart");
  }

  return (
    <Container>
      <Row>
        <Col lg={7}>
          <div>
            <h2 className="mb-2">배송 주소</h2>
            <div>
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="lastName">
                    <Form.Label>성</Form.Label>
                    <Form.Control
                      type="text"
                      onChange={handleFormChange}
                      required
                      name="lastName"
                      value={shipInfo.lastName}
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="firstName">
                    <Form.Label>이름</Form.Label>
                    <Form.Control
                      type="text"
                      onChange={handleFormChange}
                      required
                      name="firstName"
                      value={shipInfo.firstName}
                    />
                  </Form.Group>
                </Row>

                <Form.Group className="mb-3" controlId="formGridAddress1">
                  <Form.Label>연락처</Form.Label>
                  <Form.Control
                    placeholder="010-xxx-xxxxx"
                    onChange={handleFormChange}
                    required
                    name="contact"
                    value={shipInfo.contact}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGridAddress2">
                  <Form.Label>주소</Form.Label>
                  <Form.Control
                    placeholder="Apartment, studio, or floor"
                    onChange={handleFormChange}
                    required
                    name="address"
                    value={shipInfo.address}
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridCity">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      onChange={handleFormChange}
                      required
                      name="city"
                      value={shipInfo.city}
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="formGridZip">
                    <Form.Label>Zip</Form.Label>
                    <Form.Control
                      onChange={handleFormChange}
                      required
                      name="zip"
                      value={shipInfo.zip}
                    />
                  </Form.Group>
                </Row>
                <div className="mobile-receipt-area">
                  <OrderReceipt
                    cartList={cartList}
                    totalPrice={totalPrice}
                    dcPrice={dcPrice}
                  />
                </div>

                {couponList && couponList.length > 0 ? (
                  <div>
                    <h2 className="payment-title">쿠폰 정보</h2>
                    {couponList.map((c) => (
                      <Form.Check
                        onChange={redeemCoupon}
                        id={c._id}
                        type="checkbox"
                        label={c.name}
                      />
                    ))}
                  </div>
                ) : (
                  ""
                )}

                <div>
                  <h2 className="payment-title">결제 정보</h2>
                  <PaymentForm
                    handleInputFocus={handleInputFocus}
                    cardValue={cardValue}
                    handlePaymentInfoChange={handlePaymentInfoChange}
                  ></PaymentForm>
                </div>

                <Button
                  variant="dark"
                  className="payment-button pay-button"
                  type="submit"
                >
                  결제하기
                </Button>
              </Form>
            </div>
          </div>
        </Col>
        <Col lg={5} className="receipt-area">
          <OrderReceipt
            cartList={cartList}
            totalPrice={totalPrice}
            dcPrice={dcPrice}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentPage;
