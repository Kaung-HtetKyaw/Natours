import axios from "axios";
import { showAlert } from "./alert";

const stripe = Stripe(
  "pk_test_51HkZ6uII8M1Dpz7AHron79TY9DmvShtz20zYBIjFTyNEh5mZMri5BvnVDtioYmy4gcOy88NlrztIXmN3fzSbAPkH004sN6kCxv"
);

export const bookTour = async (tourId) => {
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert("error", "Error Booking Tour");
  }
};
