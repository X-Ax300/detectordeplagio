import { PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export function PayPalSubscriptionModal({ open, onClose, onSuccess }) {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { t } = useLanguage();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      
      {/* MODAL CON SCROLL INTERNO */}
      <div className="bg-white rounded-xl w-full max-w-md shadow-lg relative 
                      max-h-[80vh] overflow-y-auto p-6">

        {/* MODAL DE ÉXITO */}
        {paymentSuccess ? (
          <>
            <h2 className="text-xl font-bold mb-2 text-green-600">
              {t.PayPal.PaymentSuccess}
            </h2>
            <p className="text-gray-700 mb-4">
              {t.PayPal.youraccount} <strong>PlagDetect Plus</strong>.
            </p>

            <button
              onClick={() => {
                onSuccess?.();
                onClose();
              }}
              className="w-full py-2 bg-black text-white rounded-lg"
            >
              {t.PayPal.continue}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-2">{t.PayPal.upgradeToPlus}</h2>
            <p className="text-gray-600 mb-4">
              • {t.PayPal.callperday} <br />
              • {t.PayPal.fastAnalysis} <br />
              • {t.PayPal.oneTimePayment} <br />
            </p>

            {/* PAYPAL BUTTONS */}
            <PayPalButtons
              style={{
                layout: "vertical",
                color: "black",
                shape: "rect",
                label: "paypal",
              }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    { amount: { value: "9.99" } }
                  ],
                });
              }}
              onApprove={async (data, actions) => {
                await actions.order.capture();
                setPaymentSuccess(true);
                onSuccess?.();
              }}
              onError={(err) => {
                console.error("PayPal Error:", err);
              }}
            />

            <button
              className="mt-4 w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              onClick={onClose}
            >
              {t.PayPal.cancel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
