import axios from "axios";
import prisma from "../../../shared/prisma";
import { SslService } from "../SSL/ssl.service";
import config from "../../../config";
import { PaymentStatus } from "@prisma/client";

const initPayment = async (id: string) => {
  const paymentData = await prisma.payment.findUniqueOrThrow({
    where: {
      appointmentId: id,
    },
    include: {
      appointment: {
        include: {
          patient: true,
        },
      },
    },
  });

  const initPaymentData = {
    amount: paymentData.amount,
    transactionId: paymentData.transactionId,
    name: paymentData.appointment.patient.name,
    email: paymentData.appointment.patient.email,
    address: paymentData.appointment.patient.address,
    phone: paymentData.appointment.patient.contactNumber,
  };

  const result = await SslService.initPayment(initPaymentData);

  return {
    paymentUrl: result.GatewayPageURL,
  };
};

const validatePayment = async (payload: any) => {
  if (!payload || !payload.state || !(payload.state === "VALID")) {
    return {
      message: "Invalid payment",
    };
  }

  const res = await SslService.validatePayment(payload);

  if (res.status !== "VALID") {
    return {
      message: "Payment failed.",
    };
  }

  //const res = payload

  await prisma.$transaction(async (tx) => {
    const updatedPaymentData = await tx.payment.update({
      where: {
        transactionId: res.tran_id,
      },
      data: {
        status: PaymentStatus.PAID,
        paymentGatewayData: res,
      },
    });
    await tx.appointment.update({
      where: {
        id: updatedPaymentData.appointmentId,
      },
      data: {
        paymentStatus: PaymentStatus.PAID,
      },
    });
  });

  return {
    message: "Payment successfully completed!!!",
  };
};

export const PaymentService = { initPayment, validatePayment };
