import React from "react";
import { BrowserRouter } from "react-router-dom";
import OrderConfirmationPage from "./OrderConfirmationPage";

interface OrderRouterWrapperProps {
  orderId: string;
}

const OrderRouterWrapper: React.FC<OrderRouterWrapperProps> = ({ orderId }) => {
  return (
    <BrowserRouter>
      <OrderConfirmationPage orderId={orderId} key={orderId} />
    </BrowserRouter>
  );
};

export default OrderRouterWrapper;
